import os
import base64
from dotenv import load_dotenv
import sys

# Add the project root to sys.path to import services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.claude_service import generate_analysis, read_docx

def test_analysis():
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    pdf_path = r"c:\Dev\Hazop-main-UI\Hazop-main\frontend\public\node 11.pdf"
    docx_path = r"c:\Dev\Hazop-main-UI\Hazop-main\frontend\public\HAZOP_Master_Prompt_Library_v3.docx"
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF not found at {pdf_path}")
        return
    if not os.path.exists(docx_path):
        print(f"Error: Docx not found at {docx_path}")
        return
        
    print("Reading files...")
    with open(pdf_path, "rb") as f:
        pdf_base64 = base64.b64encode(f.read()).decode("utf-8")
        
    prompt_text = read_docx(docx_path)
    
    print("Connecting to Claude and generating analysis (this may take a minute)...")
    try:
        # Note: Using a smaller snippet of the prompt library if it's too huge, 
        # but let's try the whole thing first as requested.
        result = generate_analysis(pdf_base64, prompt_text, api_key)
        
        print("\n--- CLAUDE OUTPUT ---\n")
        print(result)
        print("\n--- END OF OUTPUT ---")
        
        # Save to a file in scratch for reference
        with open("analysis_output.txt", "w", encoding="utf-8") as f:
            f.write(result)
            
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    test_analysis()
