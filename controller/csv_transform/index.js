const fs = require("fs");
const csvTransform = require("../../components/csv_transform");

module.exports.executeTransform = (req, res) => {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    console.log(`The file is: ${req.files.file.name}`);

    const id = Math.random().toString(36).substring(7);

    csvTransform.convertCsv(id, req.files.file);

    res.redirect(`/files/transform/results?id=${id}`);
};

module.exports.getTransformStatus = async (req, res) => {
    const ret = csvTransform.status(req.params.id);
    res.json(ret);
};

module.exports.getTransformResult = async (req, res) => {
    const ret = await csvTransform.status(req.params.id);
    res.setHeader('Content-Disposition', 'attachment; filename=result.csv');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', 'text/csv');
    res.sendFile(ret.outputFileName);
    res.on("finish", () => {
        fs.unlink(ret.outputFileName, () => {});
    });
};
