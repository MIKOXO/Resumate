import OpenAI from 'openai';

const PROMPT_TEMPLATE = `Using the job description below, develop a Core Competencies section with a few main
bullet points that is ATS compatible. This is specifically for a SQL Server Database
Administrator resume — focus only on SQL Server–relevant skills and technologies
mentioned in the job description. Output only the bullet points as plain text lines,
one per line, with no markdown formatting (no asterisks, no dashes, no bold), no
header or title, and no explanation or commentary before or after the list.

Job description:
{JD_TEXT}`;

let _client = null;
const getClient = () => {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) {
      const err = new Error('GROQ_API_KEY environment variable is not set.');
      err.status = 500;
      throw err;
    }
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _client;
};

/**
 * @param {string} jobDescriptionText
 * @returns {Promise<string[]>} Array of clean bullet line strings
 */
export const generateCoreCompetencies = async (jobDescriptionText) => {
  let response;
  try {
    response = await getClient().chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'user',
          content: PROMPT_TEMPLATE.replace('{JD_TEXT}', jobDescriptionText),
        },
      ],
    });
  } catch (err) {
    const msg = err?.message || 'Unknown error';
    const error = new Error(`Groq API request failed: ${msg}`);
    error.status = 502;
    throw error;
  }

  const raw = response.choices?.[0]?.message?.content ?? '';

  return raw
    .split('\n')
    .map((line) => line.replace(/^[\s*\-•]+/, '').trim())
    .filter((line) => line.length > 0);
};
