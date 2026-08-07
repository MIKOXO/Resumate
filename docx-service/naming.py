import re
from datetime import datetime

_INVALID_CHARS = re.compile(r'[/\\:*?"<>|]')


def build_filename(prospect_name: str, company_name: str, date_str: str) -> str:
    """
    Returns a sanitized filename: ProspectName_CompanyName_MMDDYYYY.pdf

    Args:
        prospect_name: prospect's name (internal spaces preserved)
        company_name: company name (internal spaces preserved)
        date_str: ISO date string YYYY-MM-DD (from an HTML date input)
    """
    prospect_name = _INVALID_CHARS.sub("", prospect_name.strip())
    company_name = _INVALID_CHARS.sub("", company_name.strip())

    date = datetime.strptime(date_str.strip(), "%Y-%m-%d")
    date_formatted = date.strftime("%m%d%Y")

    return f"{prospect_name}_{company_name}_{date_formatted}.pdf"
