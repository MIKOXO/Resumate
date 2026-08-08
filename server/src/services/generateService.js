import { GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import FormData from 'form-data';

import b2Client from '../config/b2.js';
import Prospect from '../models/Prospect.js';
import { generateCoreCompetencies } from './groqService.js';

const DOCX_SERVICE_URL = process.env.DOCX_SERVICE_URL || 'http://localhost:8001';
const TIMEOUT_MS = 30_000;

const makeError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * @param {{ ownerId: string, teamMemberId: string, prospectId: string, jobDescription: string, companyName: string, date: string }} params
 * @returns {Promise<{ pdfBuffer: Buffer, contentDisposition: string }>}
 */
export const generateResume = async ({
  ownerId,
  teamMemberId,
  prospectId,
  jobDescription,
  companyName,
  date,
}) => {
  const chain = async () => {
    // Step 1: confirm prospect ownership
    const prospect = await Prospect.findOne({ _id: prospectId, ownerId, teamMemberId });
    if (!prospect) throw makeError('Prospect not found.', 404);

    // Step 2: download docx from B2
    let docxBuffer;
    try {
      const response = await b2Client.send(
        new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: prospect.b2Key })
      );
      const chunks = [];
      for await (const chunk of response.Body) chunks.push(chunk);
      docxBuffer = Buffer.concat(chunks);
    } catch {
      throw makeError('Failed to retrieve resume file.', 502);
    }

    // Step 3: generate bullet lines via Groq
    let bullets;
    try {
      bullets = await generateCoreCompetencies(jobDescription);
    } catch (err) {
      throw makeError(`AI generation failed: ${err.message}`, 502);
    }

    // Step 4: insert Core Competencies section via Python service
    let modifiedDocx;
    try {
      const form = new FormData();
      form.append('file', docxBuffer, { filename: 'resume.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      form.append('text', bullets.join('\n'));
      const res = await axios.post(`${DOCX_SERVICE_URL}/generate-section`, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
      });
      modifiedDocx = Buffer.from(res.data);
    } catch {
      throw makeError('Resume formatting failed.', 502);
    }

    // Step 5: convert to PDF via Python service
    let pdfBuffer;
    let contentDisposition;
    try {
      const form = new FormData();
      form.append('file', modifiedDocx, { filename: 'resume.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      form.append('prospect_name', prospect.name);
      form.append('company_name', companyName);
      form.append('date', date);
      const res = await axios.post(`${DOCX_SERVICE_URL}/convert-to-pdf`, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
      });
      pdfBuffer = Buffer.from(res.data);
      contentDisposition = res.headers['content-disposition'] || `attachment; filename="${prospect.name}_${companyName}_${date}.pdf"`;
    } catch {
      throw makeError('PDF conversion failed.', 502);
    }

    return { pdfBuffer, contentDisposition };
  };

  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(makeError('Generation is taking longer than expected, please try again.', 504)),
      TIMEOUT_MS
    )
  );

  return Promise.race([chain(), timeout]);
};
