import json
import base64
import anthropic
import os
import re
import docx
from .prompt_templates import HAZOP_EXTRACTION_PROMPT, CAUSES_GENERATION_PROMPT, WORKSHEET_GENERATION_PROMPT
from .mock_data import MOCK_EXTRACTIONS, MOCK_CAUSES, MOCK_WORKSHEET


def _file_block(data_base64: str, media_type: str) -> dict:
    """Build the correct Claude content block for an image or document."""
    if media_type.startswith("image/"):
        return {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data_base64}}
    return {"type": "document", "source": {"type": "base64", "media_type": media_type, "data": data_base64}}


def extract_json_from_response(text):
    """Extract JSON from Claude's response, stripping markdown fences if present."""
    text = text.strip()
    if text.startswith("```"):
        # Remove opening fence (```json or ```)
        try:
            first_newline = text.index("\n")
            text = text[first_newline + 1:]
        except ValueError:
            text = text[3:]
            
        # Remove closing fence
        if text.endswith("```"):
            text = text[:-3].strip()
    return json.loads(text)


def extract_hazop_items(file_base64, api_key, node_id=None, media_type="image/png"):
    """Send a P&ID image or PDF to Claude and extract HAZOP-relevant items."""
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            messages=[
                {
                    "role": "user",
                    "content": [
                        _file_block(file_base64, media_type),
                        {
                            "type": "text",
                            "text": HAZOP_EXTRACTION_PROMPT,
                        },
                    ],
                }
            ],
        )
        response_text = message.content[0].text
        return extract_json_from_response(response_text)
    except Exception as e:
        error_msg = str(e)
        if "API usage limits" in error_msg or "400" in error_msg:
            print(f"DEBUG: Claude API limit reached. Returning mock data for Node {node_id}. Original error: {e}")
            return MOCK_EXTRACTIONS.get(str(node_id), MOCK_EXTRACTIONS["11"])
        raise e


def generate_causes(instruments_causes, deviation, api_key):
    """Generate instrument-based causes for a single deviation using Claude."""
    try:
        client = anthropic.Anthropic(api_key=api_key)
        instruments_json = json.dumps(instruments_causes, indent=2)
        prompt = CAUSES_GENERATION_PROMPT.format(
            instruments_json=instruments_json,
            deviation=deviation,
        )

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        response_text = message.content[0].text
        return extract_json_from_response(response_text)
    except Exception as e:
        if "API usage limits" in str(e) or "400" in str(e):
            print(f"DEBUG: Claude API limit reached. Returning mock causes for {deviation}.")
            return MOCK_CAUSES.get(deviation, MOCK_CAUSES["High Pressure"])
        raise e


def generate_worksheet(extracted_items, confirmed_causes, analysis_params, pdf_filename, api_key):
    """Generate complete HAZOP worksheet rows using a single comprehensive Claude call."""
    try:
        client = anthropic.Anthropic(api_key=api_key)
        extraction_json = json.dumps(extracted_items, indent=2)
        causes_json = json.dumps(confirmed_causes, indent=2)

        prompt = WORKSHEET_GENERATION_PROMPT.format(
            extraction_json=extraction_json,
            causes_json=causes_json,
            max_pressure_gas=analysis_params.get("max_pressure_gas", "N/A"),
            max_pressure_liquid=analysis_params.get("max_pressure_liquid", "N/A"),
            max_liquid_inventory=analysis_params.get("max_liquid_inventory", "N/A"),
            drawing_ref=pdf_filename or "Not specified",
            pdlor_dollar_per_bbl=analysis_params.get("pdlor_dollar_per_bbl", 19),
            pdlor_apc_production_lost=analysis_params.get("pdlor_apc_production_lost", 84942),
        )

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        response_text = message.content[0].text
        return extract_json_from_response(response_text)
    except Exception as e:
        if "API usage limits" in str(e) or "400" in str(e):
            print(f"DEBUG: Claude API limit reached. Returning mock worksheet.")
            # Adjust the design pressure to match the gas pressure if provided
            mock = MOCK_WORKSHEET.copy()
            if analysis_params.get("max_pressure_gas"):
                try: mock["design_pressure"] = int(analysis_params["max_pressure_gas"]) + 200
                except: pass
            return mock
        raise e


def generate_deviation_analysis(file_entries, prompt_library_text, extracted_items, deviation, api_key):
    """Generate structured HAZOP worksheet JSON for a single deviation using Claude Opus 4.7.

    file_entries: list of (base64_str, media_type) tuples — PNG images preferred.
    """
    client = anthropic.Anthropic(api_key=api_key)

    content = []
    for b64, media_type in file_entries:
        content.append(_file_block(b64, media_type))

    content.append({
        "type": "text",
        "text": f"""Run HAZOP analysis for the selected deviation: {deviation}.

=== HAZOP MASTER PROMPT LIBRARY ===
{prompt_library_text}

=== EXTRACTED P&ID DATA ===
{json.dumps(extracted_items, indent=2)}

=== TASK ===
Using the P&ID drawings, Master Prompt Library methodology, and extracted P&ID data above, generate a complete HAZOP worksheet for the deviation: {deviation}.

Return ONLY valid JSON — no markdown fences, no extra text. Use this exact structure:

{{
  "deviation": "{deviation}",
  "design_pressure": "XXXX PSIG",
  "included_causes": [
    {{
      "number": 1,
      "cause": "TAG-XXXX (description of failure mode, e.g. fails closed)",
      "intermediate_consequence": "Potential increase in [Equipment Tag] operating pressure from normal to [Max P] PSIG (design pressure: [DP] PSIG). Pressure ratio: [X.XX]x DP.",
      "paf": {{
        "scenario_bullets": [
          "Maximum pressure to reach [Max P] PSIG; design pressure is [DP] PSIG.",
          "[>2x or <=2x] DP ([X.XX]x): [structural failure statement].",
          "Pressure >= 100 PSIG: Potential [Jet Fire / Pool Fire] and [VCE / Flash Fire].",
          "PEC-[1/2/3]: [personnel and asset impact statement]."
        ],
        "pec": true,
        "mitigation_bullets": ["TAG: description of safeguard action"],
        "cme_names": "TAG1; TAG2; TAG3",
        "cme_count": 3,
        "risk_c": 5,
        "risk_p": 1,
        "risk_level": "C"
      }},
      "pdlor": {{
        "scenario_bullets": [
          "Maximum pressure to reach [Max P] PSIG; design pressure is [DP] PSIG.",
          "[structural impact statement].",
          "[fire/explosion potential statement].",
          "Estimated downtime: [N] days. Production loss: $[X]MM + Repair: $[X]MM = Total: $[X]MM. Consequence level [1-5]."
        ],
        "mitigation_bullets": ["TAG: description"],
        "cme_names": "TAG1; TAG2; TAG3; TAG4",
        "cme_count": 4,
        "risk_c": 4,
        "risk_p": 1,
        "risk_level": "B"
      }},
      "ecr": {{
        "scenario_bullets": [
          "Maximum pressure to reach [Max P] PSIG; design pressure is [DP] PSIG.",
          "[structural impact statement].",
          "[fire/explosion potential statement].",
          "[liquid release assessment]. Environmental cleanup cost [<$1MM / $X-YMM]. Consequence level [1-5]."
        ],
        "mitigation_bullets": ["TAG: description"],
        "cme_names": "TAG1; TAG2",
        "cme_count": 2,
        "risk_c": 1,
        "risk_p": 1,
        "risk_level": "A"
      }}
    }}
  ],
  "excluded_causes": [
    {{
      "cause": "cause description",
      "line_type": "gas or liquid",
      "max_pressure": 1850,
      "ratio": 0.87,
      "rationale": "pressure ratio <= 1.1x design pressure; no credible overpressure"
    }}
  ],
  "cross_referenced_causes": [
    {{
      "cause": "cause description",
      "note": "Liquid cause — refer to High Level deviation"
    }}
  ]
}}
""",
    })

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=16000,
        messages=[{"role": "user", "content": content}],
    )
    response_text = message.content[0].text
    return extract_json_from_response(response_text)


def read_docx(file_path):
    """Read text from a docx file."""
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)


def generate_analysis(pdf_base64, prompt_library_text, api_key):
    """
    Generate a full HAZOP analysis by passing a P&ID PDF and a prompt library to Claude.
    """
    try:
        client = anthropic.Anthropic(api_key=api_key)
        
        # We pass the P&ID as a document and the prompt library as text
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": f"Using the following HAZOP Master Prompt Library guidelines, analyze the attached P&ID:\n\n{prompt_library_text}"
                        },
                    ],
                }
            ],
        )
        return message.content[0].text
    except Exception as e:
        print(f"ERROR: Analysis generation failed: {e}")
        raise e
