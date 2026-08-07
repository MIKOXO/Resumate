from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import Response, JSONResponse

import formatter

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
