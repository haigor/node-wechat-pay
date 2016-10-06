/**
 * Created by mengk on 2016-10-05.
 */


var Payment = require('../index').payment;
var config  = require('./config.json');
var path    = require('path');
var fs      = require('fs');

module.exports =  new Payment({
    appid:        config.appid,
    mch_id:       config.mch_id,
    appsecret:    config.appsecret,
    partnerKey:   config.partnerKey,
    notify_url:   'http://www.yuncreate.com/wechat/notify',
    pfx:          fs.readFileSync(path.join(__dirname, 'apiclient_cert.p12'))
});




