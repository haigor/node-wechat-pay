/**
 * Created by mengk on 2016-10-05.
 */


/*
 * 工具库
 * 1.MD5加密
 * 2.SHA1加密
 * 3.时间戳
 * 4.随机字符串
 * 5.字典排序
 * 6.查询字符串
 * 7.签名
 * 8.参数校验
 * 9.数据构造及解析(XML)
 */

// 可独立使用此库

var parser = require('xml2js');
var crypto = require('crypto');
var moment = require('moment');
var xml    = require('xml');
var _      = require('underscore');

/*
 *  将XML对象解析成JS对象
 *  @param {Object}   xml
 *  @param {Function} callback
 */
function xmlToJs (xml, callback) {
    parser.parseString(xml,{
        trim:true,
        explicitArray:true
    }, function (err, result) {
        return callback(err, result.xml);
    });
}

/*
 * 将JS对象转换成XML对象
 * @param {Object} obj
 * @param {Object} xml
 */

/*function jsToXml (obj) {
    var builder = new parser.Builder({
        allowSurrogateChars: true
    });
    return builder.buildObject({
        xml:obj
    });
}*/

function jsToXml(obj, type) {
    var data = {};
    data.xml = Object.keys(obj).map(function (key) {
        var o = {};
        if(type && type == 'cdata'){
            o[key] = {_cdata:obj[key]};
        } else {
            o[key] = obj[key];
        }
        return o;
    });
    return xml(data,{indent: true});
}

/*
 *  时间戳
 *  标准北京时间，时区为东八区，自1970年1月1日 0点0分0秒以来的秒数。注意：部分系统取到的值为毫秒级，需要转换成秒(10位数字)。
 *  可用于JS_API,微信公众号支付，微信扫码支付
 */
function timeStamp() {
    return moment().format('X');
}


/*
 *  生成微信支付的随机字符 32位
 *  @param  {NULL}   null
 *  @return {String} nonce
 */

function nonceStr(){
    var buf = crypto.randomBytes(32);
    var string = buf.toString('base64');
    string = string.replace(/\//g,'').replace(/\+/g,'');
    return string.substr(0, 32);
}

/*
 *  加密(md5)
 *  @param  {String} str
 *  @return {String} md5(str)
 */
function crypt(str, type) {
    if(type != ('md5' || 'sha1')) throw new Error('just md5 or sha1');
    return crypto.createHash(type).update(str).digest('hex');
}

/*
 *  签名
 */

function signValue(obj, key){
    // 字典排序,过滤空值,查询字符串
    var stringA = _.keys(obj).sort().filter(function (key) {
        return obj[key] != undefined && obj[key] != "";
    }).map(function (key) {
        return key + '=' + obj[key];
    }).join('&');
    // 连接key,md5加密,转换成大写,返回
    var stringTempSign = stringA + '&key=' + key;
    return crypt(stringTempSign, 'md5').toUpperCase();
}

// 开放对象
module.exports = {
    jsToXml:jsToXml,
    xmlToJs:xmlToJs,
    timeStamp:timeStamp,
    nonceStr:nonceStr,
    crypt:crypt,
    signValue:signValue
};