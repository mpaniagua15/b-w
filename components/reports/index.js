const fs = require('fs');
const config = require('../../config.json');


const reportsManager = require('./manager.js');

const reportResults = {};

module.exports.executeReport = async (id, reportType, inputFile) => {

    if(!reportsManager.hasOwnProperty(reportType)){
        return setReportError(id, 'No manager defiend');
    }

    reportResults[id] = {status: 'PENDING'};

    const inputFilePath = `${config.tmp_folder}/${id}`;

    inputFile.mv(inputFilePath, (err) => {
        if(err){
            return setReportError(id, 'Cant move file to tmp ' + err);
        }
        doExecuteReport(id,reportType, inputFilePath);
    });

};

function setReportError(id, msg) {
    reportResults[id] = {status: 'ERROR', msg};
}

async function doExecuteReport(id, reportType, fInput){
    try{
        const fOutput = await reportsManager[reportType].doReport(id, fInput);
        reportResults[id] = {status: 'OK', fOutput};
    }catch(err){
        console.log(err);
        reportResults[id] = {status: 'ERROR', msg: err};
    }
    fs.unlink(fInput, () => {});
}

module.exports.getReportStatus = async (id) => {
    const ret =  reportResults[id];
    console.log("Getting reoprt status for id: ",ret.status);
    return ret;
}
