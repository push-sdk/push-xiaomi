const axios = require('axios');
const querystring = require('querystring');

class Xiaomi {
  constructor(options = {}) {
    options.pushUrl = options.pushUrl || 'https://api.xmpush.xiaomi.com/v3/message/regid';
    this.options = options;
  }

  push(data) {
    data = Object.assign({
      'extra.notify_effect': 1,
      notify_type: -1,
      pass_through: 0
    }, data);
    axios({
      url: this.options.pushUrl,
      headers: {
        'Authorization': `key=${this.options.appSecret}`
      },
      method: 'POST',
      data: querystring.stringify({
        payload: data.payload,
        restricted_package_name: this.options.appPkgName,
        registration_id: data.list.join(','),
        title: data.title,
        description: data.content,
        notify_id: +new Date(),
        ...data
      }),
    }).then(data.success).catch(data.error);
  }

}

module.exports = Xiaomi;