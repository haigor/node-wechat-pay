# node-wechat-pay &copy; mengkeys

### <font color="red">&hearts;</font> 本模块所涵盖微信支付功能
|  序号  | 功能 | 支持情况 | 文档链接 |
| :---: |  --- | :---: |   ---   |
|  0  |         | &theta; | [微信支付官方文档](https://pay.weixin.qq.com/wiki/doc/api/index.html) |
|  1  | 刷卡支付 | <font color="green">&radic;</font> | [微信支付官方文档-刷卡支付](https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=5_1) |
|  2  | 扫码支付 | <font color="green">&radic;</font> | [微信支付官方文档-扫码支付](https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=6_1) |
|  3  | 公众号支付 | <font color="green">&radic;</font> | [微信支付官方文档-公众号支付](https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=7_1) |
|  4  | APP支付 | <font color="red">&times;</font>| [微信支付官方文档-APP支付](https://pay.weixin.qq.com/wiki/doc/api/app/app.php?chapter=8_1) |
|  5  | 代金券或立减优惠| <font color="green">&radic;</font> | [微信支付官方文档-代金券或立减优惠](https://pay.weixin.qq.com/wiki/doc/api/tools/sp_coupon.php?chapter=12_1) |
|  6  | 红包    | <font color="green">&radic;</font> | [微信支付官方文档-现金红包](https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=13_1) | 
|  7  | 企业付款 | <font color="green">&radic;</font> | [微信支付官方文档-企业付款](https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_1) |
|  8  | JSAPI   | &theta; | [微信支付官方文档-JSAPI文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115&token=&lang=zh_CN) |


## <font color="red">&hearts;</font> 模块结构
| 序号 | 模块 | 名称 | 说明 |
| :---: | --- | --- | --- |
|   1   |  Payment  | 支付模块 | 微信支付主要功能 |
|   2   |  Utils    | 工具库   | 微信支付相关的功能库 |
|   3   |  Meddleware | 中间件 | 微信支付相关中间件 |




## <font color="red">&hearts;</font> 工具库
| 序号 | 函数 | 功能 | 版本 |
| :---: | --- | --- |  --- | 
|   1  | timeStamp | 生成时间戳 |  1.0.0 |
|   2  | nonceStr  | 生成随机字符串 | 1.0.0 |
|   3  | jsToXml   | 转换(JS->XML) | 1.0.0 |
|   4  | xmlToJs   | 转换(XML->JS) | 1.0.0 |
|   5  | md5       | 加密(MD5) | 1.0.0 |
|   6  | sha1      | 加密(SHA1) | 1.0.0 |
|   7  | sort      | 字典排序 | 1.0.0 |
|   8  | queryString | 查询字符串 | 1.0.0 |
|   9  | signValue   | 签名 | 1.0.0 |




## <font color="red">&hearts;</font> 中间件
| 序号 | 函数 | 功能 | 版本 |
| :---: | --- | --- | --- |
|   1   | notice | 支付成功通知中间件 |  1.0.0 | 


## <font color="red">&hearts;</font> 接口列表
|  序号  |  函数  |  功能 | 版本 |
| :---:  |  --- |  --- |  --- |
|  1     | unifiedorder | 统一下单接口 | 1.0.0 |
|  2     | orderquery | 查询订单接口 | 1.0.0 |
|  3     | closeorder | 关闭订单接口 | 1.0.0 |
|  4     | refund | 申请退款接口 | 1.0.0 |
|  5     | refundquery | 查询退款接口 | 1.0.0 |
|  6     | downloadbill | 下载对账单接口 | 1.0.0 |
|  7     | report | 交易保障接口 | 1.0.0 |
|  8     | shorturl | 转换短链接接口 | 1.0.0 |
|  9     | authcodetoopenid | 授权码查询OPENID接口 | 1.0.0 |
|  10     | micropay | 提交刷卡支付接口 | 1.0.0 |
|  11     | reverse | 撤销订单接口 | 1.0.0 |
|  12     |      | 获取接口参数     | 1.0.0 |
|  13     |      |      | 1.0.0 |
|  14     |      |      | 1.0.0 |


## <font color="red">&hearts;</font> 模块使用指南

### &spades; 安装依赖
```
(c)npm install node-wechat-pay --save
```

### &spades; 模块引入
```
var Payment = require('node-wechat-pay').payment;
```

### &spades; 对象实例化
```
var payment = new Payment(options);
```

### &spades; 接口调用
```
payment.unifiedorder(options, callback);
```

### &spades; 工具使用
```
var Utils = require('node-wechat-pay').utils;
var md5Str = Utils.md5(str);
```

### &spades; 中间件使用
```
var Meddleware = require('node-wechat-pay').Middleware;
```

### &spades; 以Exress为例
```
app.get('/notice', Middleware, function(req, res, next){
   // 自己的逻辑，中间件处理结果将被传入req对象中。
});
```


## 相关链接
[项目仓库](https://github.com/mengkeys/node-wechat-pay)
[项目主页](http://node-wechat-pay.mengkeys.com)
[提交Bug](https://github.com/mengkeys/node-wechat-pay/issues)

## 更多...