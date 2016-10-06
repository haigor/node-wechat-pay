/**
 * User: xtech
 * Date: 16-3-13
 * File: wechat payment module.
 */


/*
 *  dependencies.
 */
//var request    = require('request');
var http       = require('http');
var https      = require('https');
var utils      = require('./utils');
var _          = require('underscore');
var request    = require('request');
var path       = require('path');


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
    this.errorparse  = options.errorparse || false;         // 可以解析错误为对应的解释
    this.appid       = options.appid;                       // 公众号ID(企业号corpid)
    this.appsecret   = options.appsecret;                   // 公众号秘钥(企业号分组secret)
    this.mch_id      = options.mch_id;                      // 商户号(微信支付账号商户号)
    //this.device_info = options.device_info;                 // 终端设备号(门店号或收银设备ID,PC网页或公众号内支付请传"WEB")
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

/*
 *  HTTP POST Request.
 *
 */
Payment.prototype.HTTPRequest = function (url, data, callback) {
    var req = http.request({
        hostname: this.hostname,
        port: 80,
        path: url,
        method: 'POST'
    }, function (req) {
        var result = "";
        req.on('data', function (chunk) {
            result += chunk;
        });

        req.on('end', function () {
            utils.xmlToJs(result, callback);
        });

        req.on('error', function (err) {
           return callback(err);
        });
    });
    req.write(data);
    req.end();
    req.on('error', function (err) {
       return callback(err);
    });
};

/*
 * HTTPs POST request.
 */
Payment.prototype.HTTPSRequest = function(url, data, callback){
    var self = this;
    var req = https.request({
        hostname: self.hostname,       // 微信服务器主机名
        path: url,                     // 接口路径
        port: 443,                     // 微信服务器端口(HTTPS为433)
        method:'POST',                 // 微信接口调用均采用POST请求
        pfx: self.pfx,                 // 微信支付证书
        passphrase: self.passphrase
    }, function (res) {
        var result = "";
        res.on('data', function(chunk) {
            // 解析XML
            result += chunk;
        });
        res.on('end', function () {
            utils.xmlToJs(result, callback);
        });
        res.on('error', function (err) {
            return callback(err);
        });
    });
    req.write(data); // 发送给微信服务器的数据)
    req.end();

    req.on('error', function (error) {
       return callback(error);
    });
};


Payment.prototype.generateData = function (api, obj) {
    var self = this;
    // 此处控制不同API参数字段名及值
    switch (api){
        // 裂变红包
        case "sendgroupredpack" || "sendredpack":
            obj.wxappid = self.appid;
            break;
        case "transfers":
            obj.mch_appid = self.appid;
            break;
        default:
            obj.appid = self.appid;
    }

    // 下面的属性是通用且必须的
    obj.mch_id = self.mch_id;
    obj.nonce_str = utils.nonceStr();
    obj.sign = utils.signValue(obj, self.partnerKey);
    return obj;
};


/*
 * @param {Object} options 订单数据
 * @param {Function} callback 结果处理回调函数
 *
 */
Payment.prototype.getBrandWCPayRequest = function (options, callback) {
    var self = this;
    var params = {
        appId: self.appid,             // 必填，公众号的唯一标识
        timeStamp: utils.timeStamp() , // 必填，生成签名的时间戳
        nonceStr: utils.nonceStr(),    // 必填，生成签名的随机串
        signType: 'MD5'
    };

    options.notify_url = self.notify_url;
    // 使用统一下单接口产生prepay_id参数
    self.unifiedorder(options, function (err, result) {
        if(err) return callback(err);
        params.package = 'prepay_id=' + result.prepay_id;
        params.paySign =  utils.signValue(params, this.partnerKey);
        return callback(null, params);
    });
};

// 统一下单
// @params {Object} order  订单数据
Payment.prototype.unifiedorder = function (order, callback) {
    var data = this.generateData('unifiedorder', order);
    data = utils.jsToXml(data);
    this.HTTPSRequest(remotes['UNIFIED_ORDER'], data, callback);
};

// 查询订单
Payment.prototype.orderquery = function (options, callback) {
    if(Function.isFunction(options)){
        callback = options;
    }
    if(!options || !options.transaction_id || !options.out_trade_no){
        callback(new Error('transaction_id or out_trade_no required.'));
    }

    var data = this.generateData('orderquery', options);
    data = utils.jsToXml(data);
    this.HTTPSRequest(remotes['ORDER_QUERY'], data, callback);
};

// 关闭订单
Payment.prototype.orderclose = function (options, callback) {
    if(_.isFunction(options)){
        callback = options;
    }
    if(!options.out_trade_no){
        callback(new Error('out_trade_no required.'));
    }
    this.HTTPSRequest(remotes['ORDER_CLOSE'],this.generateData('orderclose', options), callback);
};

// 申请退款
Payment.prototype.refund = function (options, callback) {
    this.HTTPSRequest(remotes['REFUND'],this.generateData('refund', options), callback);
};

/*
 * 退款查询
 *
 */
Payment.prototype.refundouery = function (options, callback) {
    this.HTTPSRequest(remotes['REFUND_QUERY'],this.generateData('refundquery', options), callback);
};

/*
 * 下载对账单
 * @params {Object{bill_date:{string},bill_type:{string}}} options
 *
 */
Payment.prototype.downloadBill = function (options, callback) {
    this.HTTPSRequest(remotes['DOWNLOAD_BILL'], this.generateData('downloadbill', options), callback);
};
/*
 * 测速上报
 * @params {Object} options
 * @params {Function} callback
 */
Payment.prototype.report = function (options, callback) {
    this.HTTPSRequest(remotes['REPORT'],this.generateData('report', options), callback);
};

/*
 *  提交刷卡支付
 *  @param {Object}   options
 *  @param {Function} callback
 */
Payment.prototype.micropay = function (options, callback) {
    var data = this.generateData('micropay', options);
    data = utils.jsToXml(data);
    this.HTTPSRequest(remotes['MICRO_PAY'], data , callback);
};

Payment.prototype.reverse = function (options, callback) {
    this.HTTPSRequest(remotes['RESERVE'], this.generateData('reverse', options), callback);
};

Payment.prototype.authcodetoopenid = function (options, callback) {
    this.HTTPSRequest(remotes['AUTH_CODE_TO_OPENID'], this.generateData('authcodetoopenid', options), callback);
};

// 发放代金券
Payment.prototype.send_coupon = function (options, callback) {
    this.HTTPSRequest(remotes['SEND_COUPON'], this.generateData('send_coupon', options), callback);
};

// 查询代金券批次
Payment.prototype.query_coupon_stock = function (options, callback) {
    this.HTTPSRequest(remotes['QUERY_COUPON_STOCK'], this.generateData('query_coupon_stock', options), callback);
};

// 查询代金券信息
Payment.prototype.querycouponsinfo = function (options, callback) {
    this.HTTPSRequest(remotes['QUERY_COUPONS_INFO'], this.generateData('querycouponsinfo', options), callback);
};

// 发放普通红包
Payment.prototype.sendredpack = function (options, callback) {
    this.HTTPSRequest(remotes['SEND_RED_PACK'], this.generateData('sendredpack', options), callback);
};

// 发放裂变红包
Payment.prototype.sendgroupredpack = function (options, callback) {
    this.HTTPSRequest(remotes['SEND_GROUP_RED_PACK'], this.generateData('sendgroupredpack', options), callback);
};

//查询红包记录
//{
//      appid
//      nonce_str
//      sign
//      mch_id
//      mch_billno
//      bill_type
//
//
//
// }
Payment.prototype.gethbinfo = function (options, callback) {
    this.HTTPSRequest(remotes['GET_HB_INFO'],this.generateData('gethbinfo', options), callback);
};

// 企业付款
// {
//   mch_appid
//   mchid
//   nonce_str
//   sign
//   partner_trade_no
//   openid
//   check_name        {NO_CHECK,FORCE_CHECK,OPTION_CHECK}
//   [re_user_name]
//   amount
//   desc
//   spbill_create_ip
// }
Payment.prototype.transfers = function (options, callback) {
    //组装数据：mchid,nonce_str,sign,mch_appid(appid|corpid)
    this.HTTPSRequest(remotes['TRANSFERS'], this.generateData('transfers', options), callback);
};

// 查询企业付款
Payment.prototype.gettransferinfo= function (options, callback) {
    if(typeof options == 'function'){
        return options(new Error('please provide partner_trade_no.'));
    }

    if(!options.partner_trade_no){
        return callback(new Error('options must include partner_trade_no'));
    }
    // 发起微信查询
    this.HTTPSRequest(remotes['GET_TRANSFER_INFO'], this.generateData('gettransferinfo', options), callback);
};

module.exports = function (options) {
    return new Payment(options);
};