/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-23 09:36:11 
 */
import { Device, Host, Service } from "miot";
import { GSBrandsManager } from "../BrandsManager/GSBrandsManager";
import { GSHttpRequest } from "../../helper/Https/GSHttpRequest";
import { CucoDevice, GSNoop, GSNoopFun, IRUrls } from "../../constants/constant";
import { IGSIRDeviceManager } from "./GSIRDeviceManager";
import { GSDeivce } from "../../models/device";
import { GSSpec } from "../../constants";
import { LocalStorageKeys, LocalStorageMgr } from "../LocalStorageManager/LocalStorageManager";
import { GSDevWarn } from "../../helper/GSLog";
import { GSSetSpecResult, GSSetSpecResults, GSSetSpecSuccess } from "../../constants/protocol/spec";

const kCATEGORY_KEY = 5;
class IGSIRAirconditionerMgr extends IGSIRDeviceManager {

  constructor(props) {
    super(props);
    this.onControlIdChange = GSNoopFun;
  }

  // 获取小米红外线支持控制的所有品牌
  iracBrands(): Promise {
    return GSBrandsManager.xmSupportBrands(kCATEGORY_KEY);
  }

  // 获取某个品牌支持的控制
  iracMatchCodeInfo(brand) : Promise {
    let url = IRUrls.getBrandsControlFunc(brand);
    return GSHttpRequest.GET(url);
  }

  // 对码使用 {did:string,controller_id:int,key_id(选填):int,ac_key(选填):string}
  matchCode_SendKey = ({ controllId, ac_key, key_id }) => {
    let params = { did: GSDeivce.did, controller_id: controllId };
    if (ac_key) {
      params.ac_key = ac_key;
    } else {
      params.key_id = key_id;
    }
    Service.ircontroller.sendKey(params).then((res) => {
    }).catch((err) => {
      // console.log('=========== matchCode_SendKey err: ', err);
    });
  }
  
  // 判断是否有红外遥控器, 从小米 api 获取遥控器,
  // 将来不在使用 (弃用)
  isHaveIrContoller(): Promise {
    let promise = new Promise((resolve, reject) => {
      Service.callSmartHomeAPI("/v2/irdevice/controllers", { parent_id: GSDeivce.did }).then((res) => {
        let isAdd = false;
        let irId = ""; // 遥控器ID
        let removeList = [];
        let idIndex = -1;
        for (let i = 0; i < res.controllers.length; i++) {
          if (res.controllers[i].model.substring(0, 17) == "miir.aircondition" && !!res.controllers[i].did) {
            if (res.controllers[i].did) {
              removeList.push(res.controllers[i].did);
            }
            irId = res.controllers[i].did;
            idIndex = i;
            isAdd = true;
          }
        }
        // 移除旧的遥控器
        if (idIndex > -1) { // 不要删除最后添加的红外控制器
          removeList.splice(idIndex, 1);
        }
        GSIRAirconditionerMgr.removeIrControllers(removeList);

        // 获取相关的遥控器信息
        if (isAdd && irId != "") {
          GSIRAirconditionerMgr.getIrCodeInfo(irId).then(async(ir_res) => {
            if (ir_res["code"] == 0) {
              let info = { "controller_id": ir_res.result.controller_id, "brand_id": ir_res.result.brand_id };
              this.onControlIdChange(info.controller_id);
              LocalStorageMgr.set(LocalStorageKeys.controlIdAndBrandId, info);
              // 不做等待，因为只需要把控制器传给 服务器即可。
              this.updateSpecControllerIdAndBrandId(info.controller_id, info.brand_id); 
              console.log(`=========== system|| sync cId:${ res }, info: ${ JSON.stringify(info) }`,);
              resolve(info);
            } else {
              reject({ error: 'Get ir code info error.' });
            }
          }).catch((err) => {
            reject(err);
          });
        } else {
          resolve({});
        }
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // 更新本地和远程的 控制ID 和本地的品牌ID
  updateBrandIdAndControllerId(controlId, brandId): Promise {
    let promise = new Promise((resolve, reject) => {
      this.updateLocalControllerIdAndBrandId(controlId, brandId);
      this.updateSpecControllerIdAndBrandId(controlId, brandId).then((res) => {
        resolve(res);
      }).catch((err) => {
        console.log('============ updateBrandIdAndControllerId: ', err);
      });
    });
    return promise;
  }

  // 更新Local--- 的控制ID和品牌ID
  updateLocalControllerIdAndBrandId = (controlId, brandId) => {
    GSDeivce.irConroller.id = controlId;
    GSDeivce.brand.id = brandId;
    let info = { "controller_id": controlId, "brand_id": brandId };
    this.onControlIdChange(info.controller_id);
    LocalStorageMgr.set(LocalStorageKeys.controlIdAndBrandId, info);
  }

  // 更新服务器 --- 当前控制ID和服务器控制ID
  updateSpecControllerIdAndBrandId(controlId, brandId): Promise {
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid12.control_id;
      const { siid: siid1, piid: piid1 } = GSSpec.siid12.brand_id;
      let params = [{ did: GSDeivce.did, siid, piid, value: controlId },
        { did: GSDeivce.did, siid: siid1, piid: piid1, value: brandId }];
      console.log('======== updateSpecControllerIdAndBrandId : ', params);
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('======== updateSpecControllerIdAndBrandId res: ', res);
        resolve(true); // 不做解析，默认成功。
      }).catch((error) => {
        console.log('============ updateBrandIdAndControllerId: ', err);
        resolve(false);
      });
    });
    return promise;
  }

  getControllerIdAndBrandIdFromServer(): Promise {
    let promise = new Promise((resolve, reject) => {
      this.specGetControllerIdAndBrandId().then((result) => {
        const { siid, piid } = GSSpec.siid12.control_id;
        const { siid: siid1, piid: piid1 } = GSSpec.siid12.brand_id;
        let controlId = 0;
        let brandId = 0;
        if (result.success) {
          result.value.map((val) => {
            if (val.success) {
              if (val.piid === piid) {
                controlId = val.value;
              } else if (val.piid === piid1) {
                brandId = val.value;
              }
            }
          });
        }
        if (controlId != 0 && brandId != 0) {
          this.updateLocalControllerIdAndBrandId(controlId, brandId);
          resolve({ controlId, brandId });
        } else {
          resolve(GSNoop);
        }
      });
    });
    return promise;
  }

  // 从spec获取控制ID和服务器控制ID
  specGetControllerIdAndBrandId(): Promise {
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid12.control_id;
      const { siid: siid1, piid: piid1 } = GSSpec.siid12.brand_id;
      let params = [{ did: GSDeivce.did, siid, piid },
        { did: GSDeivce.did, siid: siid1, piid: piid1 }];
      Service.spec.getPropertiesValue(params).then((res) => {
        resolve(GSSetSpecResults(res));
      }).catch((error) => {
        resolve(GSNoop);
      });
    });
    return promise;
  }    

  // turn on/off device 开关空调
  setPowerOn(isEnable): Promise {
    console.log('=======setPowerOn======: ', isEnable);
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid3.on;
      let params = [{ did: GSDeivce.did, siid, piid, value: isEnable }];
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('====== setPowerOn: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        console.log('====== setPowerOn error: ', error);
        resolve(false);
      });
    });
    return promise;
  }

  getPowerOn(): Promise {
    console.log('=======getPowerOn======');
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid3.on;
      let params = [{ did: GSDeivce.did, siid, piid }];
      Service.spec.getPropertiesValue(params).then((res) => {
        console.log('======== getPowerOn', res);
        resolve(GSSetSpecResult(res));
      }).catch((error) => {
        resolve({ success: false, val: undefined });
      });
    });
    return promise;
  }

  /**
     * 获取当前控制器有哪些空调控制功能
     */
  getAcFeatures(): Promise { // 获取m_t_s_d 相关信息
    return new Promise((resolve, reject) => {
      console.log('========= getAcFeatures GSDeivce.irConroller.id: ', GSDeivce.irConroller.id);//
      Service.ircontroller.getIrCodeFunctions({ controller_id: GSDeivce.irConroller.id }).then((res) => {
        console.log('========= getAcFeatures res: ', JSON.stringify(res));
        resolve(res);
      }).catch((err) => {
        console.log('========= getAcFeatures error: ', err);
        reject(err);
      });
    });
  }

  // 获取空调相关控制信息
  airconditionerInfo(): Promise {
    console.log('======= get airconditionerInfo======');
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid5.model_temp_speed;
      let params = [{ did: GSDeivce.did, siid, piid }];
      Service.spec.getPropertiesValue(params).then((res) => {
        resolve(res);
      }).catch((error) => {
        reject(error);
      });
    });
    return promise;
  }

  // 控制温度
  setTemp(value): Promise {
    console.log('=======setTemp======');
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid3.target_temperature;
      let params = [{ did: GSDeivce.did, siid, piid, value }];
      console.log('======== setTemp: ', params);
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('======== setTemp result: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        resolve({ success: false, val: undefined });
      });
    });
    return promise;
  }

  // 获取温度
  getTemp(): Promise {
    console.log('=======getTemp======');
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid3.target_temperature;
      let params = [{ did: GSDeivce.did, siid, piid }];
      Service.spec.getPropertiesValue(params).then((res) => {
        console.log('======== setTemp', res);
        resolve(GSSetSpecResult(res));
      }).catch((error) => {
        resolve({ success: false, val: undefined });
      });
    });
    return promise;
  }

  setMode(mode): Promise {
    console.log('======== setMode: ', mode);
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid3.mode;
      let params = [{ did: GSDeivce.did, siid, piid, value: mode }];
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('======== setMode result: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        resolve(false);
      });
    });
    return promise;
  }

  // 设置扫风开关
  setSwingOn(enable): Promise {
    console.log('======== setSwingOn: ', enable);
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid4.on;
      let params = [{ did: GSDeivce.did, siid, piid, value: enable }];
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('======== setSwingOn result: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        resolve(false);
      });
    });
    return promise;
  }

  // 设置风速
  setWindValue(val): Promise {
    console.log('======== setWindValue: ', val);
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid4.fan_level;
      let params = [{ did: GSDeivce.did, siid, piid, value: val }];
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('======== setWindValue result: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        resolve(false);
      });
    });
    return promise;
  }

  setPanelBrightnessEnable(enable): Promise {
    console.log('======== setPanelBrightnessEnable: ', enable);
    let promise = new Promise((resolve, reject) => {
      const { siid, piid } = GSSpec.siid12.led_status;
      let params = [{ did: GSDeivce.did, siid, piid, value: enable }];
      Service.spec.setPropertiesValue(params).then((res) => {
        console.log('======== setPanelBrightnessEnable result: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        resolve(false);
      });
    });
    return promise;
  }



  // 一次获取空调的所有状态值：
  getAcStateValues():promise {
    console.log('=======getAcStateValues======');
    let promise = new Promise((resolve, reject) => {
      const { siid: s0, piid: p0 } = GSSpec.siid3.on; // 空调开关
      const { siid: s1, piid: p1 } = GSSpec.siid3.target_temperature; // 温度
      const { siid: s2, piid: p2 } = GSSpec.siid3.mode; // 空调模式
      const { siid: s3, piid: p3 } = GSSpec.siid4.on; // 扫风
      const { siid: s4, piid: p4 } = GSSpec.siid4.fan_level; // 风速    
      const { siid: s5, piid: p5 } = GSSpec.siid12.led_status; // 面板灯光 
      const { siid: s6, piid: p6 } = GSSpec.siid9.status; // 睡眠模式的开关 
      const { siid: s7, piid: p7 } = GSSpec.siid12.support_key; // 是否支持面板灯光 和 扫风
      const { siid: s8, piid: p8 } = GSSpec.siid8.status; // 速冷开关         
      let params = [{ did: GSDeivce.did, siid: s0, piid: p0 },
        { did: GSDeivce.did, siid: s1, piid: p1 },
        { did: GSDeivce.did, siid: s2, piid: p2 },
        { did: GSDeivce.did, siid: s3, piid: p3 },
        { did: GSDeivce.did, siid: s4, piid: p4 },
        { did: GSDeivce.did, siid: s5, piid: p5 },
        { did: GSDeivce.did, siid: s6, piid: p6 },
        { did: GSDeivce.did, siid: s7, piid: p7 },
        { did: GSDeivce.did, siid: s8, piid: p8 }];
      Service.spec.getPropertiesValue(params).then((res) => {
        console.log('======== getAcStateValues', res);
        resolve(GSSetSpecResults(res));
      }).catch((error) => {
        resolve({ success: false, value: undefined });
      });
    });
    return promise;
  }


  getIrCodeInfo(id): Promise { // 获取遥控器详细信息
    return new Promise((resolve, reject) => {
      console.log("遥控器ID：", id);
      Service.ircontroller.getIrCodeInfo({ did: id }).then((res) => {
        console.log("res:");

        console.log(JSON.stringify(res));
        resolve(res);
      }).catch((err) => {
        console.log("err:",);
        console.log(err);
        reject(err);
      });
    });
  }

  getIrBrand(brand_id) { // 获取遥控器品牌
    return new Promise((resolve, reject) => {
      Service.ircontroller.getIrCodeBrand({ brand_id: brand_id }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  setController() {
    Host.ui.addOrCopyIR(Device.deviceID, 0, ["miir.aircondition.ir01"], {});
  }

  getAllKey(): Promise { // 获取遥控器所有按键（不起作用）
    return new Promise((resolve, reject) => {
      Service.ircontroller.getKeys({ did: "ir.1475313641271779328" }).then((res) => {
        console.log("allkeys:");
        console.log(res);
        resolve(res);
      }).catch((err) => {
        console.log("allkeys error:");
        console.log(err);
        reject(err);
      });
    });
  }

  getFunction(controllerId): Promise { // 获取m_t_s_d 相关信息
    return new Promise((resolve, reject) => {
      Service.ircontroller.getIrCodeFunctions({ controller_id: controllerId }).then((res) => {
        console.log("function:");
        resolve(res);
      }).catch((err) => {
        console.log("function error");
        reject(err);
      });
    });
  }


  

}
export const GSIRAirconditionerMgr = new IGSIRAirconditionerMgr();