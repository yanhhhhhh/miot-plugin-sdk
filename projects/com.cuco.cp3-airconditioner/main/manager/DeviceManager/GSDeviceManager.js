import { Device } from "miot";
import Host from "miot/Host";
import Service from "miot/Service";
import { Alert } from "react-native";
import { GSDevWarn } from "../../helper/GSLog";
import { CucoDevice, MIUrls } from "../tools/constant";

class IGSDeviceManager {

  constructor() {
    this.DeviceLearning = {
      tryToTurnOnDevice: () => {
                
      }

    };
  }

    deviceInfo = () => {
      Service.spec.getSpecString().then((val) => {
        console.log('=======', JSON.stringify(val));
      });
    }

    // 打开空调或者关闭空调
    turnOnAirconditioner(isEnable):Promise {
      let promise = new Promise((resolve, reject) => {
        let params = [
          { did: CucoDevice.did, siid: 2, piid: 1, value: isEnable }
        ];
        Service.spec.setPropertiesValue(params).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      });
      return promise;
    }

    // 打开小米的空调控制。
    openControlPage = () => {
      this.fetchControllerInfo().then((result) => {
        if (result) {
          Host.ui.openDevice(this.ir_did, this.ir_model, { dismiss_current_plug: false }).then((res) => {
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }).catch((err) => {
        console.log('======== openControlPage error=========', err);
      });
    }

    // 拉取，控制的 did 和 model
    fetchControllerInfo():Promise {
      let promise = new Promise((resolve, reject) => {
        if (!!this.ir_did && !!this.ir_model) {
          resolve(true);
          return;
        }
        Service.callSmartHomeAPI(MIUrls.irdevice_controllers_url, {
          parent_id: CucoDevice.did
        }).then((res) => {
          let isAdd = false;
          GSDevWarn(res.controllers);
          for (let i = 0; i < res.controllers.length; i++) {
            if (res.controllers[i].model.substring(0, 17) == "miir.aircondition") {
              isAdd = true;
              this.ir_did = res.controllers[i].did;
              this.ir_model = res.controllers[i].model;
            }
          }
          resolve(isAdd);
        }).catch((err) => {
          GSDevWarn(err);
          reject(err);
        });
      });
      return promise;
    }

    
}
export const GSDeviceManager = new IGSDeviceManager();