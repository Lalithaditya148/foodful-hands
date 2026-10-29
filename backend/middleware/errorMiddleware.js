function errorMiddleware(error, _req, res, _next) {
  console.error(error);
  if (error.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: `Invalid ${error.path}: ${error.value}` });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate value entered" });
  }
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  res
    .status(status)
    .json({ success: false, message: status === 500 ? "Server error" : error.message });
}
module.exports = errorMiddleware;
