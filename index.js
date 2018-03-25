const config = require('./config.json');
const fileUpload = require('express-fileupload');
const express = require('express');
const reportController = require('./controller/report');
const csvTransformController = require('./controller/csv_transform');
const app = express();

app.use(fileUpload());//TODO ver donde quedan para ir borrando
app.use('/static', express.static('resources/public'));

function sendView(viewName){
    return (req, res) => {
        res.sendFile(`resources/views/${viewName}.html`, { root: __dirname });
    }
}

app.get('/', sendView('reports')); //by default reports
//reports
app.post('/reports/execute', reportController.executeReport);
app.get('/reports/view/results', sendView('report_results'));
app.get('/reports/status/:id', reportController.getReportStatus);
app.get('/reports/result/:id', reportController.getReportResult);
//files
app.get('/files/transform', sendView('files_transform'));
app.get('/files/transform/results', sendView('files_transform_results'));
app.post('/files/transform/execute', csvTransformController.executeTransform);
app.get('/files/transform/:id/status', csvTransformController.getTransformStatus);
app.get('/files/transform/:id', csvTransformController.getTransformResult);

app.listen(config.port, () => {
  console.log(`App runing on port ${config.port}.`);
});
