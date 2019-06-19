const axios = require('axios');
const querystring = require('querystring');
const _ = require('lodash');

class Xiaomi {
  constructor(options = {}) {
    options.pushUrl = options.pushUrl || 'https://api.xmpush.xiaomi.com/v3/message/regid';
    options.maxLength = options.maxLength || 500;
    this.options = options;
  }

  async sleep(time) {
    return new Promise((reslove) => {
      setTimeout(() => {
        reslove({});
      }, time);
    })
  }

  async push(data) {
    let n = 0;
    let success_total = 0;
    let fail_total = 0;

    data = Object.assign({
      notify_type: -1,
      pass_through: 0
    }, data);

    data.success = data.success || function () { };
    data.fail = data.fail || function () { };
    data.finish = data.finish || function () { };

    const registration_id = _.chunk(data.list, this.options.maxLength);
    for (const i in registration_id) {
      axios({
        url: this.options.pushUrl,
        headers: {
          'Authorization': `key=${this.options.appSecret}`
        },
        method: 'POST',
        data: querystring.stringify({
          payload: data.payload,
          restricted_package_name: this.options.appPkgName,
          registration_id: registration_id[i].join(','),
          title: data.title,
          description: data.content,
          notify_id: +new Date(),
          ...data
        }),
      }).then(res => {
        if (res.data.code == 0) {
          let len = res.data.data.bad_regids ? res.data.data.bad_regids.split(',').length : 0;
          fail_total += len;
          success_total += registration_id[i].length - len;
        } else if (res.data.code == 20301) {
          fail_total += registration_id[i].length;
        }
        n++;
        data.success(res);
        if (n >= registration_id.length) {
          data.finish({
            status: 'success',
            maxLength: this.options.maxLength,
            group: registration_id.length,
            fail_total,
            success_total
          });
        }
      }).catch((err) => {
        n++;
        data.fail(err);
        if (n >= registration_id.length) {
          data.finish({
            status: 'success',
            maxLength: this.options.maxLength,
            group: registration_id.length,
            fail_total,
            success_total
          });
        }
      });

      await this.sleep(data.sleep);
    }
  }

}

module.exports = Xiaomi;