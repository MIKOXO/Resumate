export const errorHandler = (err, req, res, next) => {
  if (err?.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Maximum size is 5MB.' : 'Upload failed.';
    return res.status(400).json({ success: false, error: message });
  }

  const status = err.status || 500;
  const error = status === 500 ? 'Something went wrong. Please try again.' : err.message;
  res.status(status).json({ success: false, error });
};
