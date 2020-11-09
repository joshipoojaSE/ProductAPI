var fs = require('fs');

var APIcallLog = (header) => {
        var textData = `****************************************\nDate : ${new Date()}\n Request Header : ${header}\n****************************************\n`
        fs.appendFileSync('./APIcallLog.txt', textData);
}

module.exports = APIcallLog;