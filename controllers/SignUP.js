var router = require('express').Router();
var SqlString = require('sqlstring');
const sql = require('mssql');
var validator = require('validator');

const { executeQuery, runStoredProcedure, UpdateQuery } = require('../MsSql/Query');
const APIErrorLog = require('../Text Log/AddErrorLogintoText.js');

var ResponseModel = require('../Model/ResponseModel');
var modelBuilder = require('../helpers/modelBuilder');
var SignUPModel = require('../Model/SignUPModel')


var spName = 'sp_POST_User';
var TableName = 'tblUser';

var POSTRegister = (req, res) => {

    if (req.body && req.body.UserEmail && req.body.Password) {


        if(validator.isEmail(req.body.UserEmail)){

            var model = new modelBuilder().buildModel(req.body, new SignUPModel());

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
            var errMessage = `An error occurred during Register User`;
            APIErrorLog(spName, err, req.headers, req.body, errMessage, req.method, req.params, req.query);
            return res.status(500).send(new modelBuilder().buildModel({ status: 500, error_code: 'SERVER_ERROR', error: errMessage }, new ResponseModel()));
        })

        }
        else{
            return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: 'Invalid Email' }, new ResponseModel()));
        }
        

       
    }
    else {
        return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: 'User Email and Password is required' }, new ResponseModel()));
    }

}

var POSTLogin = (req, res) => {

    if (req.body && req.body.UserEmail && req.body.Password) {
        var MsSqlQuery = SqlString.format(`SELECT  UserID FROM  ${TableName} where UserEmail = ? AND Password = ?`, [req.body.UserEmail, req.body.Password]);

        executeQuery(MsSqlQuery)
            .then(data => {
              
                var user = data.recordset[0];
                if (user && user.UserID){
                    return res.status(200).send(new modelBuilder().buildModel({ status: 200, data: data.recordset, message: "Data Successfully Fetched" }, new ResponseModel()));
                }
                else{
                    return res.status(200).send(new modelBuilder().buildModel({ status: 401, error_code: 'INVALID_USER', error: 'Unauthenticated User' }, new ResponseModel()));
                }
                
            })
            .catch(err => {
                var errMessage = `An error occurred during Login User`;;
                APIErrorLog(MsSqlQuery, err, req.headers, req.body, errMessage, req.method, req.params, req.query);
                res.status(500).send(new modelBuilder().buildModel({ status: 500, error_code: 'SERVER_ERROR', error: errMessage }, new ResponseModel()));
            })

    }
    else {
        return res.status(200).send(new modelBuilder().buildModel({ status: 412, error_code: 'INVALID_REQ_DATA', error: 'User Email and Password is required' }, new ResponseModel()));
    }
}



router.post('/api/register', POSTRegister);
router.post('/api/login', POSTLogin);

module.exports = router;