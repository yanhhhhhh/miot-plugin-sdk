/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-23 11:21:56 
 */

const HEADER = {
  headers: {
    'content-type': 'application/json; charset = UTF-8'
  },
  body: undefined,
  method: 'POST'
};

export class GSHttpRequest {

  static GET(url):Promise {
    let request = new GSHttpRequest();
    return request.get(url);
  }

  get(url):Promise {
    let promise = new Promise((resolve, reject) => {
      fetch(url).then((res) => {
        resolve(res.json());
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  static POST(url, data):Promise {
    let request = new GSHttpRequest();
    return request.post(url, data);
  }

  post(url, params):Promise {
    let header = HEADER;
    header.body = params;
    let promise = new Promise((resolve, reject) => {
      fetch(url, header).then((res) => {
        resolve(res.json());
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  } 
}
