/**
 * User: xtech
 * Date: 16-3-13
 * File: wechat payment module.
 */


/*
 *  dependencies.
 */
//var request    = require('request');
var https      = require('https');
var utils      = require('./utils');
var _          = require('underscore');
var request    = require('request');
var path       = require('path');

/*
 * basic data
 */
//var BANKS      = require(path.join(__dirname,'..','data','bank.json'));     // 银行数据
//var ERRORS     = require(path.join(__dirname,'..','data','error.json'));    // 错误数据
//var CURRENCY   = require(path.join(__dirname,'..','data','currency.json')); // 货币数据
//var TYPES      = require(path.join(__dirname,'..','data','type.json'));     // 类型数据

// 接口地址列表
var remotes = {
    MICRO_PAY           : "/pay/micropay",                              // 提交刷卡支付API
    UNIFIED_ORDER       : "/pay/unifiedorder",                          // 统一下单接口
    ORDER_QUERY         : "/pay/orderquery",                            // 订单查询接口
    ORDER_CLOSE         : "/pay/closeorder",                            // 关闭订单接口
    REFUND_QUERY        : "/pay/refundquery",                           // 退款查询接口
    DOWNLOAD_BILL       : "/pay/downloadbill",                          // 下载对账单接口
    SHORT_URL           : "/tools/shorturl",                            // 短链接转换接口
    AUTH_CODE_TO_OPENID : "/tools/authcodetoopenid",                    // 授权码查询openid接口
    RESERVE             : "/secapi/pay/reverse",                        // 撤销订单接口
    REFUND              : "/secapi/pay/refund",                         // 退款接口
    REPORT              : "/payitil/report",                            // 交易保障接口
    SEND_COUPON         : "/mmpaymkttransfers/send_coupon",             // 发放代金券接口
    QUERY_COUPON_STOCK  : "/mmpaymkttransfers/query_coupon_stock",      // 查询代金券批次
    QUERY_COUPONS_INFO  : "/mmpaymkttransfers/querycouponsinfo",        // 查询代金券信息
    SEND_RED_PACK       : "/mmpaymkttransfers/sendredpack",             // 发送普通红包接口及
    SEND_GROUP_RED_PACK : "/mmpaymkttransfers/sendgroupredpack",        // 发送裂变红包
    GET_BH_INFO         : "/mmpaymkttransfers/gethbinfo",               // 查询红包记录
    TRANSFERS           : "/mmpaymkttransfers/promotion/transfers",     // 企业付款
    GET_TRANSFER_INFO   : "/mmpaymkttransfers/gettransferinfo"          // 查询企业付款
};

/*
 *  微信服务器主机域
 */

var domain = 'api.mch.weixin.qq.com';
/*
 *  url地址解析
 *  @params {String} remote
 */

function urlParse(name){
    return remotes[name];
}

/*
 * Payment Object.
 */

var Payment = function (options) {
    this.hostname    = domain;
    this.port        = 433;
    this.errorparse  = options.errorparse || false;         // 可以解析错误为对应的解释
    this.appid       = options.appid;                       // 公众号ID(企业号corpid)
    this.appsecret   = options.appsecret;                   // 公众号秘钥(企业号分组secret)
    this.mch_id      = options.mch_id;                      // 商户号(微信支付账号商户号)
    this.device_info = options.device_info;                 // 终端设备号(门店号或收银设备ID,PC网页或公众号内支付请传"WEB")
    this.passphrase  = options.passphrase || this.mch_id;   //
    this.notify_url  = options.notify_url;                  // 支付结果通知地址
    this.pfx         = options.pfx;                         // 微信支付证书
    this.partnerKey  = options.partnerKey;                  // 商户32位支付秘钥
};

Payment.prototype.getAccessToken = function (callback) {
    var self = this;
    self.request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + this.appid + '&secret=' + this.appsecret, function (err, token) {
       if(err) return callback(err);
       return callback(null, token);
    });
};

Payment.prototype.verifyAccessToken = function (callback) {

};

Payment.prototype.referrerAccessToken = function () {

};

Payment.prototype.getBrandWCPayRequest = function (options, callback) {
    /*
     "appId" ： "wx2421b1c4370ec43b",                        //公众号名称，由商户传入
     "timeStamp"：" 1395712654",                             //时间戳，自1970年以来的秒数
     "nonceStr" ： "e61463f8efa94090b1f366cccfbbb444",       //随机串
     "package" ： "prepay_id=u802345jgfjsdfgsdg888",
     "signType" ： "MD5",                                    //微信签名方式：
     "paySign" ： "70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
     */
};


// signature generator
Payment.prototype.signature = function () {
    var obj =  {
        appId: this.appId, // 必填，公众号的唯一标识
        timestamp: utils.timeStamp() , // 必填，生成签名的时间戳
        nonceStr: utils.nonceStr() // 必填，生成签名的随机串
    };
    obj.signature = utils.signValue(obj, this.partnerKey);  // 必填，签名，见附录1
    return obj;
};

Payment.prototype.request = function (url, callback) {
    request(url, function (err, result) {
        if(err) return callback(err);
        return callback(null, result.access_token);
    });
};

/*
 * HTTPs POST request.
 */
Payment.prototype.sslRequest = function(url, data, callback){
    var self = this;
    var req = https.request({
        hostname: self.hostname,       // 微信服务器主机名
        path: url,                     // 接口路径
        port: self.port,               // 微信服务器端口(HTTPS为433)
        data:data,                     // 发送给微信服务器的数据
        method:'POST',                 // 微信接口调用均采用POST请求
        pfx: self.pfx                  // 微信支付证书
    }, function (err, result) {
        if(err) return callback(err);
        // 解析XML
        return callback(null, utils.xmlToJs(result));
    });

    req.on('error', function (error) {
       return callback(error);
    });
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
    this.request(REMOTES['UNIFIED_ORDER'], data, callback);
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
    this.request(REMOTES['ORDER_QUERY'], data, callback);
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
    this.request(REMOTES['ORDER_CLOSE'], data, callback);
};

// 申请退款
Payment.prototype.refund = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['REFUND'], data, callback);
};

/*
 * 退款查询
 *
 */
Payment.prototype.refundQuery = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['REFUND_QUERY'], data, callback);
};

/*
 * 下载对账单
 * @params {Object{bill_date:{string},bill_type:{string}}} options
 *
 */
Payment.prototype.downloadBill = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['DOWNLOAD_BILL'], data, callback);
};
/*
 * 测速上报
 * @params {Object} options
 * @params {Function} callback
 */
Payment.prototype.report = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['REPORT'], data, callback);
};

/*
 *  提交刷卡支付
 *  @param {Object}   options
 *  @param {Function} callback
 */
Payment.prototype.micropay = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['MICRO_PAY'], data, callback);
};

Payment.prototype.reverse = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['RESERVE'], data, callback);
};

Payment.prototype.authcodetoopenid = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['AUTH_CODE_TO_OPENID'], data, callback);
};

// 发放代金券
Payment.prototype.send_coupon = function (options, callback) {

};

// 查询代金券批次
Payment.prototype.query_coupon_stock = function (options, callback) {

};

// 查询代金券信息
Payment.prototype.querycouponsinfo = function (options, callback) {

};

// 发放普通红包
Payment.prototype.sendredpack = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['SEND_RED_PACK'], data, callback);
};

// 发放裂变红包
Payment.prototype.sendgroupredpack = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['SEND_GROUP_RED_PACK'], data, callback);
};

//查询红包记录
Payment.prototype.gethbinfo = function (options, callback) {
    var data = this.generateData(options);
    this.request(REMOTES['GET_HB_INFO'], data, callback);
};

// 企业付款
Payment.prototype.transfers = function (options, ballback) {

};

// 查询企业付款
Payment.prototype.gettransferinfo= function (options, callback) {

};



module.exports = function (options) {
    return new Payment(options);
};