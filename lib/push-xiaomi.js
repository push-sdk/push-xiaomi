const axios = require('axios');
const querystring = require('querystring');
conschunk = require('lodash/chunk');

class Xiaomi {
  constructor(options = {}) {
    options.pushUrl = options.pushUrl || 'https://api.xmpush.xiaomi.com/v3/message/regid';
    options.queryUrl = options.queryUrl || 'https://api.xmpush.xiaomi.com/v1/trace/message/status';
    options.maxLength = options.maxLength || 500;
    options.timeout = options.timeout || 300000;
    options.maxQuery = options.maxQuery || 150;
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

    const registration_id = chunk(data.list, this.options.maxLength);
    for (const i in registration_id) {
      axios({
        url: this.options.pushUrl,
        headers: {
          'Authorization': `key=${this.options.appSecret}`
        },
        method: 'POST',
        timeout: this.options.timeout,
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
        data.success(res);
      }).catch((err) => {
        fail_total += registration_id[i].length;
        data.fail(err);
      }).then(() => {
        n++;
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

  async query({ msg_id }) {
    const data = {
      delivered: 0,
      click: 0,
    };
    const startTime = +new Date();

    const msg_id_arr = chunk(msg_id, this.options.maxQuery);
    for (let list of msg_id_arr) {
      const promiseArr = [];

      for (let id of list) {
        promiseArr.push(axios({
          url: this.options.queryUrl,
          headers: {
            'Authorization': `key=${this.options.appSecret}`
          },
          method: 'GET',
          timeout: this.options.timeout,
          params: {
            msg_id: id
          },
        }))
      }
      const res = await Promise.all(promiseArr).catch(() => { return null; });
      for (let i in res) {
        if (res[i].data.code == 0 && res[i].data.data && res[i].data.data.data) {
          data.delivered += res[i].data.data.data.delivered || 0;
          data.click += res[i].data.data.data.click || 0;
        }
      }
    }

    const endTime = +new Date();

    data.useTime = endTime - startTime;

    return data;
  }

}

module.exports = Xiaomi;