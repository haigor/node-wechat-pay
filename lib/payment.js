/**
 * User: xtech
 * Date: 16-3-13
 * File: wechat payment module.
 */


/*
 *  dependencies.
 */
const xml2json   = require('xml2json');
const request    = require('request');
const moment     = require('moment');
const crypto     = require('crypto');
const https      = require('https');
const url        = require('url');
const _          = require('underscore');
const path       = require('path');
const fs         = require('fs');
const qs         = require('querystring');

/*
 * basic data
 */
const banks      = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','bank.json')));     // 银行数据
const urls       = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','url.json')));      // 地址数据
const errors     = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','error.json')));    // 错误数据
const currency   = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','currency.json'))); // 货币数据
const types      = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','type.json')));     // 类型数据

/*
 * 通过json构造构造xml
 * @params {Object} dt
 * @result {Object} xml
 */

function generatorXML(dt) {
    var data = {};
    data.xml = dt;
    return xml2json.toXml(JSON.stringify(data));
}

/*
 * 将xml转成json
 * @params {Object XML} xml
 * @result {Object json}  data
 */
function parseXML(data) {
    return JSON.parse(xml2json.toJson(data)).xml;
}

/*
 * 14位时间戳
 */
function timestamp(){
    return moment().format('YYYYMMDDhhmmss');
}

/*
 *  32位随机字符串
 */
function nonce(){
    var str = crypto.randomBytes(16);
    var buf = new Buffer(str).toString('hex');
    return buf.toUpperCase();
}

/*
 * md5加密
 * @params {String} str.
 */
function md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}

/*
 * sha1 加密
 * @params {String} str.
 */
function sha1(str){
    return crypto.createHash('sha1').update(str).digest('hex');
}

/*
 *  url地址解析
 *  @params {String} remote
 */

function urlParse(remote){
    return url.parse(remote);
}

/*
 *  签名
 */

function signValue(object, key){
    var keys = Object.keys(object);
    // 过滤空值属性
    var notNullKeys = _.filter(keys, function(num){
        return object[num] != '';
    });
    // 剔除重复属性
    var uniqKeys = _.uniq(notNullKeys);
    // ASCII排序
    var sortKeys =  uniqKeys.sort();
    // 构造过滤后的对象
    var resultObj = {};
    sortKeys.forEach(function (item) {
           resultObj[item] = object[item];
    });
    resultObj['key'] = key;
    var stringSignTemp = qs.stringify(resultObj);
    return md5(stringSignTemp).toUpperCase();
}

/*
 * Payment Object.
 */

var Payment = function (options) {
    this.errorparse  = options.errorparse || false;         // 可以解析错误为对应的解释
    this.appid       = options.appid;                       // 公众号ID(企业号corpid)
    this.appsecret   = options.appsecret;                   // 公众号秘钥(企业号分组secret)
    this.mch_id      = options.mch_id;                      // 商户号(微信支付账号商户号)
    this.device_info = options.device_info;                 // 终端设备号(门店号或收银设备ID,PC网页或公众号内支付请传"WEB")
    this.passphrase  = options.passphrase || this.mch_id;   //
    this.notify_url  = options.notify_url;                  // 支付结果通知
    this.pfx         = options.pfx;                         // 证书
    this.partnerKey  = options.partnerKey;                  // 商户秘钥
};


Payment.prototype.getBanks = function () {
    return banks;
};

Payment.prototype.getCurrency = function () {
    return currency;
};

Payment.prototype.getErrors = function () {
    return errors;
};

Payment.prototype.getErrorsByApi = function (api) {
    return errors[api];
};

/*
 * @param {String} bank
 *
 */
Payment.prototype.getBankByCode = function (code) {
    var result = {};
    result[bank] = banks[code];
    return result;
};

/*
 * @param {String} bank
 *
 */
Payment.prototype.getBankByName = function (name) {
    var invert = _.invert(banks);
    var list = _.keys(invert);
    var values = _.filter(list, function (num) {
        return num.indexOf(name) != -1;
    });
    var result = {};
    values.forEach(function (item) {
        result[invert[item]] = banks[invert[item]];
    });
    return result;
};

/*
 * @param {String} api
 * @param {String} code
 */
Payment.prototype.error = function (api, code) {
    return error[api][code];
};

// signature generator
Payment.prototype.signature = function () {

};

// signature verify
Payment.prototype.verify = function () {

};


/*
 * HTTP POST request.
 */
Payment.prototype.httpPost = function(url, data, callback){
    data = generatorXML(data);
    request({
        url: url,
        method: 'POST',
        body: data
    }, function (err, response, body) {
        if (err) {
            return callback(err);
        }
        return callback(null, parseXML(body));
    });
};

/*
 *  HTTPS POST request.
 */
Payment.prototype.httpsPost = function (url, data, callback) {
    data = generatorXML(data);
    // 解析请求地址
    var urlObj = urlParse(url);

    // 发送数据包
    var req  = https.request({
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.path,
        pfx: this.pfx,
        passphrase: this.passphrase,
        method: 'POST'
    }, function (res) {
        var body = "";
        // 接收返回数据
        res.on('data', function (chunk) {
            body += chunk;
        });

        // 数据接收完毕
        res.on('end', function(){
            return callback(null, parseXML(body));
        });
    });

    // 请求出错
    req.on('error', function(error) {
        return callback(error);
    });
    // 发送数据
    req.pipe(data);
};

Payment.prototype.generateData = function (obj) {
    var data = {
        appid:       this.appid,
        mch_id:      this.mch_id,
        device_info: this.device_info
    };
    _.map(_.keys(obj), function (item) {
        data[item] = obj[item];
    });
    data.sign = signValue(data, this.partnerKey);
    return data;
};

// 统一下单
// @params {Object} order  订单数据

Payment.prototype.unifiedOrder = function (order, callback) {
    var data = this.generateData(order);
    this.httpsPost(urls['UNIFIED_ORDER'], data, callback);
};

// 查询订单
Payment.prototype.orderQuery = function (options, callback) {
    if(Function.isFunction(options)){
        callback = options;
    }
    if(!options || !options.transaction_id || !options.out_trade_no){
        callback(new Error('transaction_id or out_trade_no required.'));
    }
    var data = this.generateData(options);
    this.httpsPost(urls['ORDER_QUERY'], data, callback);
};

// 关闭订单
Payment.prototype.orderClose = function (options, callback) {
    if(_.isFunction(options)){
        callback = options;
    }
    if(!options.out_trade_no){
        callback(new Error('out_trade_no required.'));
    }
    var data = this.generateData(options);
    this.httpsPost(urls['ORDER_CLOSE'], data, callback);
};

// 申请退款
Payment.prototype.refund = function (options, callback) {
    var data = this.generateData(options);
    this.httpsPost(urls['REFUND'], data, callback);
};

/*
 * 退款查询
 *
 */
Payment.prototype.refundQuery = function (options, callback) {
    var data = this.generateData(options);
    this.httpsPost(urls['REFUND_QUERY'], data, callback);
};

/*
 * 下载对账单
 * @params {Object{bill_date:{string},bill_type:{string}}} options
 *
 */
Payment.prototype.downloadBill = function (options, callback) {
    var data = this.generateData(options);
    this.httpsPost(urls['DOWNLOAD_BILL'], data, callback);
};
/*
 * 测速上报
 * @params {Object} options
 * @params {Function} callback
 */
Payment.prototype.report = function (options, callback) {
    var data = this.generateData(options);
    this.httpsPost(urls['REPORT'], data, callback);
};

module.exports = function (options) {
    return new Payment(options);
};