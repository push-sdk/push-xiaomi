# push-xiaomi

> 小米推送Node服务

根据小米提供的推送服务实现的 Node 版SDK。支持小米通知栏推送功能，欢迎大家使用。

[华为推送](https://www.npmjs.com/package/push-huawei)

[魅族推送](https://www.npmjs.com/package/push-meizu)

[oppo推送](https://www.npmjs.com/package/push-oppo)

[友盟推送](https://www.npmjs.com/package/push-umeng)

[ios推送](https://www.npmjs.com/package/push-ios)

## 安装
```
npm install push-xiaomi --save-dev
```

## 实例
```javascript
const Xiaomi = require('push-xiaomi');
const xiaomi = new Xiaomi({
  appId: 'appId',
  appSecret: 'appSecret',
  appPkgName: '应用包名'
});

xiaomi.push({
  title: '标题',
  content: '内容',
  list: ['pushId'], 
  sleep: 0, // 请求间隔时间/毫秒
  success(res){}, // 成功回调
  error(err){}, // 失败回调
  finish(){} // 所有请求回调
});
```

## 参数

| key | value |
|:----|:----|
|appId|appID|
|$appSecret|appSecret|
|appPkgName|应用包名|
|pushUrl|推送URL 默认 https://api.xmpush.xiaomi.com/v3/message/regid|
|...|详细参数看小米官方文档|


[小米官方文档](https://dev.mi.com/console/doc/detail?pId=1163#_0)