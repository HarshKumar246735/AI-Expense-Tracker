const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { buildReport, toCsv, writePdf, fileSlug } = require("../services/reportService");

const getReport = asyncHandler(async (req, res) => {
  const report = await buildReport(req.user, req.query);
  const { format } = req.query;

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileSlug(report.title)}.csv"`);
    return res.send(toCsv(report));
  }
  if (format === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileSlug(report.title)}.pdf"`);
    return writePdf(report, req.user.currency, res);
  }
  return sendSuccess(res, { report, currency: req.user.currency });
});

module.exports = { getReport };
