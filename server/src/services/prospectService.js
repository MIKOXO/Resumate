import mongoose from 'mongoose';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import b2Client from '../config/b2.js';
import Prospect from '../models/Prospect.js';
import { getOwnedTeamMember } from './teamMemberService.js';

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
 * @param {{ ownerId: string, teamMemberId: string, name: string, file: object }} params
 * @returns {Promise<object>} Created Prospect document
 */
export const uploadProspect = async ({ ownerId, teamMemberId, name, file }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Prospect name is required.');
    err.status = 400;
    throw err;
  }

  await getOwnedTeamMember({ ownerId, teamMemberId });
  assertDocx(file);

  const prospectId = new mongoose.Types.ObjectId();
  const b2Key = `${ownerId}/${teamMemberId}/${prospectId}.docx`;

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
    teamMemberId,
    name: name.trim(),
    b2Key,
    uploadedAt: new Date(),
  });
};

/**
 * @param {{ ownerId: string, teamMemberId: string }} params
 * @returns {Promise<object[]>} Prospect documents matching both ownerId and teamMemberId
 */
export const listProspects = async ({ ownerId, teamMemberId }) => {
  return Prospect.find({ ownerId, teamMemberId });
};

/**
 * @param {{ ownerId: string, teamMemberId: string, prospectId: string, file: object }} params
 * @returns {Promise<object>} Updated Prospect document
 */
export const replaceProspectResume = async ({ ownerId, teamMemberId, prospectId, file }) => {
  const prospect = await Prospect.findOne({ _id: prospectId, ownerId, teamMemberId });
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
 * @param {{ ownerId: string, teamMemberId: string, prospectId: string }} params
 * @returns {Promise<void>}
 */
export const deleteProspect = async ({ ownerId, teamMemberId, prospectId }) => {
  const prospect = await Prospect.findOne({ _id: prospectId, ownerId, teamMemberId });
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
 * @param {{ ownerId: string, teamMemberId: string }} params
 * @returns {Promise<void>}
 */
export const deleteAllProspectsForTeamMember = async ({ ownerId, teamMemberId }) => {
  const prospects = await Prospect.find({ ownerId, teamMemberId });
  await Promise.all(
    prospects.map((prospect) =>
      deleteProspect({ ownerId, teamMemberId, prospectId: prospect._id })
    )
  );
};
