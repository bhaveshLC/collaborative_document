export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong.";
  console.log(err);
  res.status(statusCode).json({
    status: "failed",
    statusCode,
    message,
  });
}
