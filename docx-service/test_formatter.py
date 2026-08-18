import io
import unittest

from docx import Document
from docx.shared import Pt

import formatter


class FormatterTests(unittest.TestCase):
    def _document_bytes(self, document):
        buffer = io.BytesIO()
        document.save(buffer)
        return buffer.getvalue()

    def test_detects_body_size_inherited_from_normal_style(self):
        document = Document()
        document.styles["Normal"].font.name = "Arial"
        document.styles["Normal"].font.size = Pt(10.5)
        document.add_paragraph("First body paragraph with inherited formatting.")
        document.add_paragraph("Second body paragraph with inherited formatting.")

        font_name, font_size = formatter.detect_body_style(document)

        self.assertEqual(font_name, "Arial")
        self.assertEqual(font_size, Pt(10.5))

    def test_copies_dominant_header_and_body_paragraph_formatting(self):
        document = Document()
        document.styles["Normal"].font.name = "Aptos"
        document.styles["Normal"].font.size = Pt(10)
        document.add_paragraph("A long body paragraph establishes the normal resume style.")
        document.add_paragraph("Another body paragraph makes that style dominant.")
        header = document.add_paragraph("EXPERIENCE")
        header.paragraph_format.space_before = Pt(12)
        header.paragraph_format.space_after = Pt(4)
        header.paragraph_format.left_indent = Pt(18)
        header_run = header.runs[0]
        header_run.font.name = "Aptos Display"
        header_run.font.size = Pt(14)
        header_run.font.bold = True

        result = Document(io.BytesIO(formatter.insert_core_competencies(
            self._document_bytes(document), ["Relevant skill"], "resume.docx"
        )))
        core_header, bullet = result.paragraphs[-2:]

        self.assertEqual(core_header.text, "CORE COMPETENCIES")
        self.assertEqual(core_header.runs[0].font.name, "Aptos Display")
        self.assertEqual(core_header.runs[0].font.size, Pt(14))
        self.assertTrue(core_header.runs[0].font.bold)
        self.assertEqual(core_header.paragraph_format.space_before, Pt(12))
        self.assertEqual(core_header.paragraph_format.left_indent, Pt(18))
        self.assertTrue(core_header.paragraph_format.page_break_before)
        self.assertEqual(bullet.text, "• Relevant skill")
        self.assertEqual(formatter._paragraph_value(bullet, result, "size"), Pt(10))

    def test_title_case_headers_keep_title_case_section_name(self):
        document = Document()
        document.add_paragraph("Body text that establishes the default style.")
        header = document.add_paragraph("Professional Summary")
        header.runs[0].font.bold = True
        header.runs[0].font.size = Pt(13)

        result = Document(io.BytesIO(formatter.insert_core_competencies(
            self._document_bytes(document), ["Relevant skill"], "resume.docx"
        )))

        self.assertEqual(result.paragraphs[-2].text, "Core Competencies")


if __name__ == "__main__":
    unittest.main()
