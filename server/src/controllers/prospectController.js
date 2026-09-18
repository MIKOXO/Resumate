import multer from 'multer';

import * as prospectService from '../services/prospectService.js';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== DOCX_MIME) {
      const err = new Error('Only .docx resume files are allowed.');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

export const uploadSingle = uploadMiddleware.single('file');

export const upload = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Prospect name is required.' });
    }

    const prospect = await prospectService.uploadProspect({
      ownerId: req.user,
      name: name.trim(),
      file: req.file,
    });
    res.status(201).json({ success: true, data: prospect });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const prospects = await prospectService.listProspects({ ownerId: req.user });
    res.json({ success: true, data: prospects });
  } catch (err) {
    next(err);
  }
};

export const replace = async (req, res, next) => {
  try {
    const { prospectId } = req.params;
    const prospect = await prospectService.replaceProspectResume({
      ownerId: req.user,
      prospectId,
      file: req.file,
    });
    res.json({ success: true, data: prospect });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { prospectId } = req.params;
    await prospectService.deleteProspect({ ownerId: req.user, prospectId });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};