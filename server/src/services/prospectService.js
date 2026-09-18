import mongoose from 'mongoose';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import b2Client from '../config/b2.js';
import Prospect from '../models/Prospect.js';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const B2_BUCKET = process.env.B2_BUCKET_NAME;

const assertDocx = (file) => {
  if (!file || !file.buffer) {
    const err = new Error('A .docx resume file is required.');
    err.status = 400;
    throw err;
  }

  if (file.mimetype !== DOCX_MIME) {
    const err = new Error('Only .docx resume files are allowed.');
    err.status = 400;
    throw err;
  }
};

/**
 * @param {{ ownerId: string, name: string, file: object }} params
 * @returns {Promise<object>} Created Prospect document
 */
export const uploadProspect = async ({ ownerId, name, file }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Prospect name is required.');
    err.status = 400;
    throw err;
  }

  assertDocx(file);

  const prospectId = new mongoose.Types.ObjectId();
  const b2Key = `${ownerId}/${prospectId}.docx`;

  await b2Client.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET,
      Key: b2Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return Prospect.create({
    _id: prospectId,
    ownerId,
    name: name.trim(),
    b2Key,
    uploadedAt: new Date(),
  });
};

/**
 * @param {{ ownerId: string }} params
 * @returns {Promise<object[]>} Prospect documents owned by the user
 */
export const listProspects = async ({ ownerId }) => {
  return Prospect.find({ ownerId });
};

/**
 * @param {{ ownerId: string, prospectId: string, file: object }} params
 * @returns {Promise<object>} Updated Prospect document
 */
export const replaceProspectResume = async ({ ownerId, prospectId, file }) => {
  const prospect = await Prospect.findOne({ _id: prospectId, ownerId });
  if (!prospect) {
    const err = new Error('Prospect not found.');
    err.status = 404;
    throw err;
  }

  assertDocx(file);

  await b2Client.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET,
      Key: prospect.b2Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  prospect.uploadedAt = new Date();
  await prospect.save();
  return prospect;
};

/**
 * @param {{ ownerId: string, prospectId: string }} params
 * @returns {Promise<void>}
 */
export const deleteProspect = async ({ ownerId, prospectId }) => {
  const prospect = await Prospect.findOne({ _id: prospectId, ownerId });
  if (!prospect) {
    const err = new Error('Prospect not found.');
    err.status = 404;
    throw err;
  }

  await b2Client.send(
    new DeleteObjectCommand({
      Bucket: B2_BUCKET,
      Key: prospect.b2Key,
    })
  );

  await Prospect.deleteOne({ _id: prospectId });
};

/**
 * @param {{ ownerId: string }} params
 * @returns {Promise<void>}
 */
export const deleteAllProspects = async ({ ownerId }) => {
  const prospects = await Prospect.find({ ownerId });
  await Promise.all(
    prospects.map((prospect) => deleteProspect({ ownerId, prospectId: prospect._id }))
  );
};