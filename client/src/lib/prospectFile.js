const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const DOCX_NAME_RE = /\.docx$/i
export const MAX_PROSPECT_FILE_SIZE = 5 * 1024 * 1024

export const validateProspectFile = (file) => {
  if (!file) return 'Select a .docx file to upload.'
  if (!DOCX_NAME_RE.test(file.name) && file.type !== DOCX_MIME) return 'Only .docx resume files are allowed.'
  if (file.size > MAX_PROSPECT_FILE_SIZE) return 'File must be under 5MB.'
  return ''
}
