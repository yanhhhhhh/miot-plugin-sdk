/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-22 18:02:34 
 */

import { Service } from "miot";
import { CucoDevice } from "../../constants/constant";
import { GSDeivce } from "../../models/device";

/**
 * 红外线控制管理类
 */
export class IGSIRDeviceManager {

  /**
     * 获取小米的红外线种类
     */
  irXMCategorys():Promise {
    let promise = new Promise((resolve, reject) => {
      Service.ircontroller.getCategories().then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // 获取小米支持的设备的所有Keys
  irXMAllControlerKeys(): Promise {
    let promise = new Promise((resolve, reject) => {
      Service.ircontroller.getKeys({ did: CucoDevice.did }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }


  // 添加遥控器
  addController(name, irType): Promise {
    let promise = new Promise((resolve, reject) => {
      let params = { name: name, parent_id: CucoDevice.did, category: irType, brand_id: 97 };
      Service.ircontroller.controllerAdd(params).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // 获取遥控器信息
  controllerInfo(irDid): Promise {
    let promise = new Promise((resolve, reject) => {
      let params = { did: irDid };
      Service.ircontroller.getIrCodeInfo(params).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // 获取所有的遥控器列表
  controllersList():Promise {
    let promise = new Promise((resolve, reject) => {
      Service.ircontroller.getList({ parent_id: CucoDevice.did }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // 删除所有的遥控器
  deleteAllControllers():Promise {
    let promise = new Promise((resolve, reject) => {
      this.controllersList().then((list) => {
        const { controllers } = list.result;
        let tasks = [];
        controllers.forEach((controller) => {
          const { did } = controller;
          tasks.push(this.deleteController(did));
        });
        Promise.all(tasks).then((values) => {
          resolve(values);
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    });
    return promise;
  }

  removeIrControllers(dids: Array): Promise {
    let promise = new Promise((resolve, reject) => {
      if (!dids || dids.length == 0) {
        resolve(true);
      } else {
        let tasks = [];
        dids.forEach((did) => {
          tasks.push(this.deleteController(did));
        });
        Promise.all(tasks).then((values) => {
          resolve(values);
        }).catch((error) => {
          reject(false);
        });
      }
    });
    return promise;
  }

  // 删除单个遥控器
  deleteController(did): Promise {
    let promise = new Promise((resolve, reject) => {
      Service.ircontroller.controllerDel({ did: did }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // 获取所有遥控器按键
  getControllerKeys(did):Promise {
    let promise = new Promise((resolve, reject) => {
      let params = { did: did };
      Service.ircontroller.getKeys(params).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

}
export const GSIRDeviceManager = new IGSIRDeviceManager();