import * as generateService from '../services/generateService.js';

export const generate = async (req, res, next) => {
  try {
    const { teamMemberId, prospectId, jobDescription, companyName, date } = req.body;

    if (!teamMemberId || !prospectId || !jobDescription || !companyName || !date) {
      return res.status(400).json({
        success: false,
        error: 'teamMemberId, prospectId, jobDescription, companyName, and date are all required.',
      });
    }

    const { pdfBuffer, contentDisposition } = await generateService.generateResume({
      ownerId: req.user,
      teamMemberId,
      prospectId,
      jobDescription,
      companyName,
      date,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', contentDisposition);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
