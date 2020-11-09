var router = require('express').Router();
var SqlString = require('sqlstring');
const sql = require('mssql');
var validator = require('validator');

const { executeQuery, runStoredProcedure, UpdateQuery } = require('../MsSql/Query');
const APIErrorLog = require('../Text Log/AddErrorLogintoText.js');

var ResponseModel = require('../Model/ResponseModel');
var modelBuilder = require('../helpers/modelBuilder');
var ProductModule = require('../Model/ProductModule')


var spName = 'sp_POST_Product';
var TableName = 'tblProduct';
var spName1 = 'sp_PUT_Product';

var GETProduct = (req, res) => {
    var MsSqlQuery = SqlString.format(`SELECT  * FROM  ${TableName} where 1=1`);

    if(req.params.ProductID){
        MsSqlQuery += SqlString.format(' AND ProductID = ?', [req.params.ProductID])
    }

    executeQuery(MsSqlQuery)
            .then(data => {
              
                res.status(200).send(new modelBuilder().buildModel({ status: 200, data: data.recordset, message: "Data Successfully Fetched" }, new ResponseModel()));
                
            })
            .catch(err => {
                var errMessage = `An error occurred during Product List`;;
                APIErrorLog(MsSqlQuery, err, req.headers, req.body, errMessage, req.method, req.params, req.query);
                res.status(500).send(new modelBuilder().buildModel({ status: 500, error_code: 'SERVER_ERROR', error: errMessage }, new ResponseModel()));
            })
}

var POSTProduct = (req, res) => {

    if (req.body && req.body.ProductName) {


            var model = new modelBuilder().buildModel(req.body, new ProductModule());

            
        var inputparams = [];

        Object.keys(model).forEach(element => {
            inputparams.push({
                "name": element,
                "type": sql.NVarChar,
                "value": model[element] ? model[element] : null
            })
        });

        runStoredProcedure(spName, inputparams)
        .then(result => {

            if (result.recordset[0] && result.recordset[0].error) {

                return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: result.recordset[0].error }, new ResponseModel()));
            }
            res.status(200).send(new modelBuilder().buildModel({ status: 200, data: result.recordset, message: "data successfully Inserted" }, new ResponseModel()));
        })
        .catch(err => {
            var errMessage = `An error occurred during Product Add`;
            APIErrorLog(spName, err, req.headers, req.body, errMessage, req.method, req.params, req.query);
            return res.status(500).send(new modelBuilder().buildModel({ status: 500, error_code: 'SERVER_ERROR', error: errMessage }, new ResponseModel()));
        })

       
       
    }
    else {
        return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: 'Product Name is required' }, new ResponseModel()));
    }

}

var PUTProduct = (req, res) => {
    if (req.body && req.body.ProductName) {


        var model = new modelBuilder().buildModel(req.body, new ProductModule());
        model.ProductID = req.params.ProductID;
    var inputparams = [];

    Object.keys(model).forEach(element => {
        inputparams.push({
            "name": element,
            "type": sql.NVarChar,
            "value": model[element] ? model[element] : null
        })
    });

    runStoredProcedure(spName1, inputparams)
    .then(result => {

        if (result.recordset && result.recordset[0].error) {

            return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: result.recordset[0].error }, new ResponseModel()));
        }
        res.status(200).send(new modelBuilder().buildModel({ status: 200, data: result.recordset, message: "data successfully Updated" }, new ResponseModel()));
    })
    .catch(err => {
        var errMessage = `An error occurred during Product Update`;
        APIErrorLog(spName1, err, req.headers, req.body, errMessage, req.method, req.params, req.query);
        return res.status(500).send(new modelBuilder().buildModel({ status: 500, error_code: 'SERVER_ERROR', error: errMessage }, new ResponseModel()));
    })

   
   
}
else {
    return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: 'Product Name is required' }, new ResponseModel()));
}
}

var DELETEProduct = (req, res) => {
    var MsSqlQuery = SqlString.format(`DELETE  FROM  ${TableName} where ProductID = ?`, [req.params.ProductID]);

    executeQuery(MsSqlQuery)
            .then(data => {
             
                res.status(200).send(new modelBuilder().buildModel({ status: 200, data: data.rowsAffected, message: "Data Successfully Deleted" }, new ResponseModel()));
                
            })
            .catch(err => {
                var errMessage = `An error occurred during Product Delete`;;
                APIErrorLog(MsSqlQuery, err, req.headers, req.body, errMessage, req.method, req.params, req.query);
                res.status(500).send(new modelBuilder().buildModel({ status: 500, error_code: 'SERVER_ERROR', error: errMessage }, new ResponseModel()));
            })
}



router.get('/api/product/list', GETProduct);
router.get('/api/product/:ProductID', GETProduct);
router.post('/api/product/add', POSTProduct);
router.put('/api/product/:ProductID', PUTProduct);
router.delete('/api/product/:ProductID', DELETEProduct);

module.exports = router;