const fs = require("fs");
const reports = require("../../components/reports");

module.exports.executeReport = (req, res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    console.log(`The file is: ${req.files.file.name} and type: ${req.body.reportType}`);

    const id = Math.random().toString(36).substring(7);

    reports.executeReport(id, req.body.reportType , req.files.file);

    res.redirect(`/reports/view/results?id=${id}`);
};

module.exports.getReportStatus = async (req, res) => {
    const ret = await reports.getReportStatus(req.params.id);
    res.json(ret);
};

module.exports.getReportResult = async (req, res) => {
    const ret = await reports.getReportStatus(req.params.id);
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', 'text/csv');
    res.sendFile(ret.fOutput);
    res.on("finish", () => {
        fs.unlink(ret.fOutput, () => {});
    });
};
