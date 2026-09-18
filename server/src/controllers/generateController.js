import * as generateService from '../services/generateService.js';

export const generate = async (req, res, next) => {
  try {
    const { prospectId, jobDescription, companyName, date } = req.body;

    if (!prospectId || !jobDescription || !companyName || !date) {
      return res.status(400).json({
        success: false,
        error: 'prospectId, jobDescription, companyName, and date are all required.',
      });
    }

    const { pdfBuffer, contentDisposition } = await generateService.generateResume({
      ownerId: req.user,
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
