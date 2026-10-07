function sendSuccess(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

module.exports = { sendSuccess };
