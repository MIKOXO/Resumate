from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import Response, JSONResponse

import converter
import formatter
import naming

app = FastAPI()

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@app.post("/generate-section")
async def generate_section(
    file: UploadFile = File(...),
    text: str = Form(...),
):
    try:
        docx_bytes = await file.read()
        bullet_lines = [line for line in text.splitlines() if line.strip()]
        result_bytes = formatter.insert_core_competencies(
            docx_bytes, bullet_lines, filename=file.filename or "<unknown>"
        )
        return Response(content=result_bytes, media_type=DOCX_MIME)
    except Exception as exc:
        return JSONResponse(
            status_code=422,
            content={"error": f"Failed to process document: {str(exc)}"},
        )


@app.post("/convert-to-pdf")
async def convert_to_pdf(
    file: UploadFile = File(...),
    prospect_name: str = Form(...),
    company_name: str = Form(...),
    date: str = Form(...),
):
    try:
        docx_bytes = await file.read()
        pdf_bytes = converter.convert_to_pdf(docx_bytes)
        filename = naming.build_filename(prospect_name, company_name, date)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": f"PDF conversion failed: {str(exc)}"},
        )
