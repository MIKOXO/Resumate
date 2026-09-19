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
    unique = uuid.uuid4().hex

    # LibreOffice uses a single user profile by default. A separate profile is
    # required per request so concurrent conversions cannot contend for its lock.
    with tempfile.TemporaryDirectory(prefix="resumate-pdf-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        profile_dir = temp_dir / "libreoffice-profile"
        profile_dir.mkdir()
        docx_path = temp_dir / f"{unique}.docx"
        pdf_path = temp_dir / f"{unique}.pdf"
        docx_path.write_bytes(docx_bytes)

        try:
            result = subprocess.run(
                [
                    "soffice",
                    f"-env:UserInstallation={profile_dir.as_uri()}",
                    "--headless",
                    "--convert-to", "pdf",
                    "--outdir", str(temp_dir),
                    str(docx_path),
                ],
                capture_output=True,
                text=True,
                timeout=LIBREOFFICE_TIMEOUT_SECONDS,
            )
        except FileNotFoundError as exc:
            raise RuntimeError("LibreOffice executable 'soffice' was not found.") from exc
        except subprocess.TimeoutExpired as exc:
            raise RuntimeError(
                f"LibreOffice conversion timed out after {LIBREOFFICE_TIMEOUT_SECONDS} seconds."
            ) from exc

        if result.returncode != 0 or not pdf_path.exists():
            output = (result.stderr.strip() or result.stdout.strip() or "no output")
            raise RuntimeError(
                f"LibreOffice conversion failed (exit {result.returncode}): {output}"
            )

        return pdf_path.read_bytes()
