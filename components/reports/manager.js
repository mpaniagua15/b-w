const config = require('../../config.json');
const mysql = require('mysql2');
const connectionPool = mysql.createPool(config.mysql);


//reports...
//Base de Emisiones
const EmisionsReport = require('./impl/emisions');
//Base de Devoluciones
const DevolutionsReport = require('./impl/devolutions');
//Busqueda por TransactionID el Flexfile para asientos
const SeatForTransactionIdReport = require('./impl/seatForTransactionId');
//Busqueda por PNR el Flexfile para asientos
const SeatForPNRReport = require('./impl/seatForPNR');


module.exports = {
    emisions: new EmisionsReport(connectionPool),
	devolutions: new DevolutionsReport(connectionPool),
	seatForTransactionId: new SeatForTransactionIdReport(connectionPool),
	seatForPNR: new SeatForPNRReport(connectionPool),
};
