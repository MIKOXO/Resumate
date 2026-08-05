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
    const { teamMemberId } = req.params;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Prospect name is required.' });
    }

    if (!teamMemberId) {
      return res.status(400).json({ success: false, error: 'Team member id is required.' });
    }

    const prospect = await prospectService.uploadProspect({
      ownerId: req.user,
      teamMemberId,
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
    const { teamMemberId } = req.params;
    const prospects = await prospectService.listProspects({
      ownerId: req.user,
      teamMemberId,
    });
    res.json({ success: true, data: prospects });
  } catch (err) {
    next(err);
  }
};

export const replace = async (req, res, next) => {
  try {
    const { teamMemberId, prospectId } = req.params;
    const prospect = await prospectService.replaceProspectResume({
      ownerId: req.user,
      teamMemberId,
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
    const { teamMemberId, prospectId } = req.params;
    await prospectService.deleteProspect({ ownerId: req.user, teamMemberId, prospectId });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
