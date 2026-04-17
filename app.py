import os
import base64
from flask import Flask, render_template, request, session, jsonify, redirect, url_for
from flask_session import Session
from config import Config
from services.claude_service import extract_hazop_items, generate_causes, generate_worksheet, generate_analysis, read_docx

app = Flask(__name__)
app.config.from_object(Config)
Session(app)

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Node ID → PDF filename mapping (files in frontend/public/)
NODE_PDF_MAP = {
    "11": "node 11.pdf",
    "15": "Oxy-Node 15.pdf",
    "28": "simplified version of node 28 1.pdf",
}


@app.after_request
def add_cors_headers(response):
    """Allow CORS for the React dev server."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def index():
    return render_template("upload.html")


@app.route("/api/extract", methods=["POST"])
def api_extract():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted"}), 400

    # Read and encode PDF
    pdf_bytes = file.read()
    pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

    # Save file temporarily
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    with open(filepath, "wb") as f:
        f.write(pdf_bytes)

    try:
        result = extract_hazop_items(pdf_base64, app.config["ANTHROPIC_API_KEY"])
        # Store in session for later use
        session["extracted_items"] = result
        session["pdf_filename"] = file.filename
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/extract-node", methods=["POST"])
def api_extract_node():
    """Extract HAZOP items from a pre-loaded node P&ID PDF."""
    data = request.get_json()
    if not data or "node_id" not in data:
        return jsonify({"error": "node_id is required"}), 400

    node_id = str(data["node_id"])
    filename = NODE_PDF_MAP.get(node_id)
    if not filename:
        return jsonify({"error": f"Unknown node: {node_id}. Available: {list(NODE_PDF_MAP.keys())}"}), 400

    # Resolve the PDF file path from frontend/public/
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(base_dir, "frontend", "public", filename)

    if not os.path.exists(pdf_path):
        return jsonify({"error": f"PDF file not found for node {node_id}: {filename}"}), 404

    try:
        with open(pdf_path, "rb") as f:
            pdf_base64 = base64.b64encode(f.read()).decode("utf-8")

        app.logger.info("Extracting HAZOP items from node %s (%s)...", node_id, filename)
        result = extract_hazop_items(pdf_base64, app.config["ANTHROPIC_API_KEY"], node_id=node_id)

        # Store in session for downstream endpoints
        session["extracted_items"] = result
        session["pdf_filename"] = filename

        return jsonify(result)
    except Exception as e:
        app.logger.error("Extraction failed for node %s: %s", node_id, e)
        # Check if it was a quota error to provide a more helpful message even if mock failed
        err_str = str(e)
        if "API usage limits" in err_str:
            return jsonify({
                "error": "Anthropic API quota reached. Please restart the server to ensure your new API key is active, or wait for the quota to reset.",
                "details": err_str
            }), 429
        return jsonify({"error": str(e)}), 500


@app.route("/api/save-items", methods=["POST"])
def api_save_items():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    # Extract and store analysis parameters separately
    analysis_params = data.pop("analysis_params", {})
    session["analysis_params"] = analysis_params

    session["extracted_items"] = data
    return jsonify({"redirect": url_for("deviations")})


@app.route("/deviations")
def deviations():
    items = session.get("extracted_items")
    if not items:
        return redirect(url_for("index"))
    return render_template("deviations.html", items=items)


@app.route("/api/submit-deviations", methods=["POST"])
def api_submit_deviations():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    session["selected_deviations"] = data.get("deviations", [])
    session["other_deviation"] = data.get("other_text", "")

    app.logger.info("Selected deviations: %s", session["selected_deviations"])
    if session["other_deviation"]:
        app.logger.info("Other deviation: %s", session["other_deviation"])

    return jsonify({"status": "ok", "message": "Deviations saved successfully"})


@app.route("/api/generate-causes", methods=["POST"])
def api_generate_causes():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    deviations = data.get("deviations", [])
    other_text = data.get("other_text", "")
    if other_text:
        deviations.append(other_text)

    if not deviations:
        return jsonify({"error": "No deviations selected"}), 400

    items = session.get("extracted_items")
    if not items or "instruments_causes" not in items:
        return jsonify({"error": "No extracted items in session. Please re-upload the P&ID."}), 400

    instruments_causes = items["instruments_causes"]

    # Save selected deviations to session
    session["selected_deviations"] = deviations
    session["other_deviation"] = other_text

    try:
        causes = {}
        for deviation in deviations:
            causes[deviation] = generate_causes(
                instruments_causes, deviation, app.config["ANTHROPIC_API_KEY"]
            )
        session["causes"] = causes
        return jsonify({"causes": causes, "status": "ok"})
    except Exception as e:
        app.logger.error("Causes generation failed: %s", e)
        return jsonify({"error": str(e)}), 500


@app.route("/causes")
def causes():
    causes_data = session.get("causes")
    if not causes_data:
        return redirect(url_for("deviations"))
    return render_template("causes.html", causes=causes_data)


@app.route("/api/confirm-causes", methods=["POST"])
def api_confirm_causes():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    confirmed_causes = data.get("confirmed_causes", {})
    session["confirmed_causes"] = confirmed_causes

    # Gather all required data from session
    extracted_items = session.get("extracted_items")
    if not extracted_items:
        return jsonify({"error": "No extracted items in session. Please re-upload the P&ID."}), 400

    analysis_params = dict(session.get("analysis_params", {}))
    
    # Use defaults only if not already set by the user in the frontend
    if "pdlor_dollar_per_bbl" not in analysis_params:
        analysis_params["pdlor_dollar_per_bbl"] = app.config.get("PDLOR_DOLLAR_PER_BBL", 19)
    if "pdlor_apc_production_lost" not in analysis_params:
        analysis_params["pdlor_apc_production_lost"] = app.config.get("PDLOR_APC_PRODUCTION_LOST", 84942)
        
    pdf_filename = session.get("pdf_filename", "Unknown")

    try:
        worksheet_data = generate_worksheet(
            extracted_items,
            confirmed_causes,
            analysis_params,
            pdf_filename,
            app.config["ANTHROPIC_API_KEY"],
        )
        session["worksheet_data"] = worksheet_data
        return jsonify(worksheet_data)
    except Exception as e:
        app.logger.error("Worksheet generation failed: %s", e)
        return jsonify({"error": str(e)}), 500


@app.route("/worksheet")
def worksheet():
    worksheet_data = session.get("worksheet_data")
    if not worksheet_data:
        return redirect(url_for("causes"))
    analysis_params = session.get("analysis_params", {})
    pdf_filename = session.get("pdf_filename", "Unknown")
    return render_template(
        "worksheet.html",
        worksheet=worksheet_data,
        analysis_params=analysis_params,
        pdf_filename=pdf_filename,
    )


@app.route("/api/generate-analysis", methods=["POST"])
def api_generate_analysis():
    """
    Unified endpoint to generate a complete HAZOP analysis from a P&ID PDF 
     and a Master Prompt Library (docx/md/txt).
    """
    if "drawing" not in request.files or "prompt_library" not in request.files:
        return jsonify({"error": "Both 'drawing' (PDF) and 'prompt_library' (DOCX/MD/TXT) files are required"}), 400

    drawing_file = request.files["drawing"]
    prompt_file = request.files["prompt_library"]

    if drawing_file.filename == "" or prompt_file.filename == "":
        return jsonify({"error": "One or more files have no filename"}), 400

    # Process Drawing (PDF)
    drawing_bytes = drawing_file.read()
    drawing_base64 = base64.b64encode(drawing_bytes).decode("utf-8")

    # Save prompt library temporarily to process it
    temp_prompt_path = os.path.join(app.config["UPLOAD_FOLDER"], prompt_file.filename)
    prompt_file.seek(0) # Ensure we're at the start
    prompt_file.save(temp_prompt_path)

    try:
        # Process Prompt Library based on extension
        prompt_text = ""
        if prompt_file.filename.lower().endswith(".docx"):
            prompt_text = read_docx(temp_prompt_path)
        else:
            # Assume text-based (MD, TXT, etc.)
            with open(temp_prompt_path, "r", encoding="utf-8", errors="ignore") as f:
                prompt_text = f.read()

        app.logger.info("Generating analysis for %s using library %s...", drawing_file.filename, prompt_file.filename)
        
        result = generate_analysis(drawing_base64, prompt_text, app.config["ANTHROPIC_API_KEY"])
        
        # Clean up temp file
        if os.path.exists(temp_prompt_path):
            os.remove(temp_prompt_path)
            
        return jsonify({
            "status": "success",
            "filename": drawing_file.filename,
            "analysis": result
        })
    except Exception as e:
        app.logger.error("Analysis generation failed: %s", e)
        # Clean up temp file on error too
        if 'temp_prompt_path' in locals() and os.path.exists(temp_prompt_path):
            os.remove(temp_prompt_path)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
