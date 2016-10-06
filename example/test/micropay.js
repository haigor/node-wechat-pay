/**
 * Created by mengkey on 2016-10-06.
 */

var payment = require('../payment');

var data = {
    body:"测试一下",
    out_trade_no:"DSFLDAJFKDJ8F0D8S0A98098",
    total_fee:888,
    spbill_create_ip:"116.55.76.87",
    auth_code:"120061098828009406"
};

payment.micropay(data, function (err, result) {
    console.log(err || result);
});