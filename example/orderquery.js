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

};
