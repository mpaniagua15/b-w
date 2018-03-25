const Promise = require('bluebird');
const config = require('../../config');
const fs = require('fs');
const { exec } = require('child_process');

class Report {

    constructor(connectionPool){
        this.connectionPool = connectionPool;
    }

    async doReport(id, filePath){

        const tableName = `tmp_${id}`;

        const connection = await this._getConnection();

        await this._doExecuteCreateTmpTable(connection,tableName);

        await this._doExecutePopulateMetaTable(connection, tableName, filePath);

        await this._doPrepareReportQueries(connection, tableName);

        const stream = fs.createWriteStream(`${filePath}.csv`, {flags: 'w'});

        await this._doExecuteReport(connection, tableName, stream);

        this._doExecuteDropTmpTable(connection, tableName);

        stream.close();

        connection.release();

        return `${filePath}.csv`;
    }

    _getConnection(){
        const self = this;
        return new Promise((resolve, reject) => {
            self.connectionPool.getConnection(function(err, connection) {
                if(err){
                    return reject(err);
                }
                resolve(connection);
            });
        });
    }

    _doExecutePopulateMetaTable(connection, tableName, filePath){
        return new Promise((resolve, reject) => {
            let execCmd = `${config.mysql.command}`;
            execCmd += `"LOAD DATA INFILE '${filePath}' INTO TABLE ${tableName} `;
            execCmd += `FIELDS TERMINATED BY '${config.reports.input.fields_separation}';"`

            exec(execCmd, (err, stdout, stderr) => {
                if(err){
                    return reject(err);
                }
                console.log("Exec cmd: "+stdout);
                resolve();
            });

        });
    }

    _doPrepareReportQueries(connection, tableName) {

        const self = this;

        const queries = this._prepareReportQueries(tableName);

        return Promise.all(
            queries.map((query) => {
                self._executeQuery(connection, query)
            })
        );

    }

    _doExecuteDropTmpTable(connection, tableName) {
        const query = `DROP TABLE ${tableName};`;
        console.log(`query: ${query}`);
        connection.execute(query, [], (err, rows, fields) => {});
    }

    _doExecuteCreateTmpTable(connection, tableName) {
        const tableDef = this._tableDefinition();
        const query = `CREATE TABLE ${tableName} ${tableDef};`;
        console.log(`query: ${query}`);
        return this._executeQuery(connection, query);
    }

    _executeQuery(connection, query){
        return new Promise((resolve, reject) => {
            connection.execute(query, [], (err, rows, fields) => {
                if(err){
                    return reject(err);
            	}
            	resolve();
            });
        });
    }

    _doExecuteReport(connection, tableName, stream){

        const self = this;

        return new Promise((resolve, reject) => {

            const header = this._reportHeader();

            stream.write(`${header}\n`);

            const query = self._reportQuery(tableName);

            console.log(`query: ${query}`);

            let hasError = false;

            let first = true;

            connection.query(query)
                .on('error', (err) => {
                    console.log("Error!");
                    hasError = true;
                    reject(err);
                }).on('result', (row) => {

                    if(first){
                        first = false;
                    }else{
                        connection.pause();

                        const line = self._rowToString(row);

                        stream.write(`${line}\n`, () => {
                            connection.resume();
                        });
                    }

                }).on('end', () => {
                    console.log("End?");
                    if(!hasError){
                        console.log("End No Error :)");
                        resolve();
                    }
                })
            ;
        });
    }

    //abstract
    _rowToString(r){
        //return `${r.idboleto}; ${r.nombre}`;
        throw new Error('Unimplemented _rowToString');
    }

    _tableDefinition(){
        //return "(id int, pepe varchar(256))";
        throw new Error('Unimplemented _tableDefinition');
    }

    _reportQuery(tableName){
        //return `SELECT * FROM ${tableName};`
        throw new Error('Unimplemented _reportQuery');
    }

    _reportHeader(){
        return "";
    }

    //optional
    _prepareReportQueries(tableName){
        return [];
    }

}

module.exports.Report = Report;
