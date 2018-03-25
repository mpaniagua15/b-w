const config = require('../../config.json');
const csv = require('csv');
const fs = require('fs');

const transformResults = {};

function doTransformHeader(record){
    if(record.length>35){
        record[7] = record[7] + '-changed';
    }else{
        record.splice(7, 0, 'myColumn');
    }
    return record;
}

function doTransformRow(record){

    function doTransformFunc(country, country2){
        let ret = '-cuak';
        //TODO logic
        return ret;
    }

    const country = record[5].toUpperCase();
    const country2 = record[6].toUpperCase();
    const newValue = doTransformFunc(country, country2);
    //ya tiene la columna que quiero?
    if(record.length>35){
        record[7] = record[7] + newValue;
    }else{
        record.splice(7, 0, newValue);
    }
    return record;
}

module.exports.status = (id) => {
    return transformResults.hasOwnProperty(id) ? transformResults[id]:{status:'ERROR', msg:'Not found'};
}


module.exports.convertCsv = (id, inputFile) => {

    const inputFilePath = `${config.tmp_folder}/${id}`;

    inputFile.mv(inputFilePath, (err) => {
        if(err){
            return setTransformError(id, 'Cant move file to tmp ' + err);
        }
        doConvertCsv(id, inputFilePath);
    });
    
}

function setTransformError(id, msg){
    transformResults[id] = {status: 'ERROR', msg};
}

function doConvertCsv(id, inputFileName) {
    transformResults[id] = {status: 'PENDING'};

    let firstLine = true;
    
    const outputFileName = `${inputFileName}.${id}.csv`;

    const stream = fs.createReadStream(inputFileName)
        .pipe(csv.parse({
            trim: true,
            skip_empty_lines: true,
            delimiter: ';'
        }))
        .pipe(csv.transform((record)=>{
            if(firstLine){
                firstLine = false;
                return doTransformHeader(record);
            }
            return doTransformRow(record);
        }))
        .pipe(csv.stringify({
            header: true,
            delimiter: ';'
        }))
        .pipe(fs.createWriteStream(outputFileName))
    ;
    
    stream.on('finish', () =>{
        transformResults[id] = {status: 'OK', outputFileName};
        fs.unlink(inputFileName, () => {});
    });
    stream.on('error', (err)=>{
        setTransformError(id, err);
        fs.unlink(inputFileName, () => {});
    });
}
