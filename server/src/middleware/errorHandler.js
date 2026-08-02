export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const error = status === 500 ? 'Something went wrong. Please try again.' : err.message;
  res.status(status).json({ success: false, error });
};
