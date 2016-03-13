/**
 * User: xtech
 * Date: 16-3-13
 * File:
 */

const path = require('path');
const fs   = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));
const Payment = require('../lib/payment');
const payment = Payment(config);

const order = {
    body:"",
    detail:"",
    out_tra_no:"",
};

payment.unifiedorder(order, function (error, result) {
    console.log(error || result);
});
