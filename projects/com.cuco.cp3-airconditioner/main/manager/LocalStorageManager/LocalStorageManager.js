import localStorage from "localStorage";
import { Host } from 'miot';
export const LocalStorageKeys = {
  controllerIdAndBrand: 'controllerIdAndBrand', // 根据是否有 controller_id  和  品牌名称 同时成立作为配码成功条件
  ACControlValue: 'ACControlValue',
  controlIdAndBrandId: 'controlIdAndBrandId',
  ACFeaturesFromControlId: 'ACFeaturesFromControlId'
  // ....
};
const noop = {}; 
class LocalStorageManager {
  set(key, value) { // 设置缓存
    Host.storage.set(key, JSON.stringify(value));
  }

  /**
     *
     * @param key
     * @returns {Promise<unknown>}
     */
  // Host.storage.get(key).then(res => {
  //     console.log("res", res)
  // }).catch(error => {
  //     console.log("error", error)
  // });
  get(key): Promise { // 读取缓存
    return new Promise((resolve, reject) => {
      Host.storage.get(key).then((res) => {
        if (res) {
          resolve(JSON.parse(res));
        } else {
          resolve({});
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  // 删除指定缓存
  remove(key) { 
    Host.storage.set(key, JSON.stringify(noop));
  }
}
export const LocalStorageMgr = new LocalStorageManager();