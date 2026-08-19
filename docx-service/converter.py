import subprocess
import tempfile
import uuid
from pathlib import Path

LIBREOFFICE_TIMEOUT_SECONDS = 25


def convert_to_pdf(docx_bytes: bytes) -> bytes:
    """
    Converts a .docx bytes payload to PDF bytes via LibreOffice headless.
    Temp files are always cleaned up in a finally block.
    """
    tmp_dir = Path(tempfile.gettempdir())
    unique = uuid.uuid4().hex
    docx_path = tmp_dir / f"{unique}.docx"
    pdf_path = tmp_dir / f"{unique}.pdf"
    pdf_bytes = None

    try:
        docx_path.write_bytes(docx_bytes)

        result = subprocess.run(
            [
                "soffice",
                "--headless",
                "--convert-to", "pdf",
                "--outdir", str(tmp_dir),
                str(docx_path),
            ],
            capture_output=True,
            text=True,
            timeout=LIBREOFFICE_TIMEOUT_SECONDS,
        )

        if result.returncode != 0 or not pdf_path.exists():
            stderr = result.stderr.strip() or result.stdout.strip()
            raise RuntimeError(f"LibreOffice conversion failed: {stderr}")

        pdf_bytes = pdf_path.read_bytes()

    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(
            f"LibreOffice conversion timed out after {LIBREOFFICE_TIMEOUT_SECONDS} seconds."
        ) from exc

    finally:
        if docx_path.exists():
            docx_path.unlink()
        if pdf_path.exists():
            pdf_path.unlink()

    if pdf_bytes is None:
        raise RuntimeError("LibreOffice conversion failed without producing a PDF.")

    return pdf_bytes
