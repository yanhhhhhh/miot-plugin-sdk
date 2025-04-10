import { GSIRAirconditionerMgr } from "./GSIRAirconditionerMgr";
import { LocalStorageMgr, LocalStorageKeys } from "../LocalStorageManager/LocalStorageManager";
class AirControllerPannelManager {
  /**
     * 获取空调基础面板控制功能
     */
  getAllPannelResource() {
    let controllerId = "";
    LocalStorageMgr.get(LocalStorageKeys.controllerIdAndBrand).then((res) => {
      controllerId = res.controller_id;
      GSIRAirconditionerMgr.getFunction(controllerId).then((rs) => {
        console.log("get pannel:");
        console.log(JSON.stringify(rs));
      }).catch((error) => {
        console.log("errrr:");
        console.log(error);
      });
    }).catch((err) => {
      console.log("跳转到配码页面");
    });
  }
}
export const AirControllerPannelMgr = new AirControllerPannelManager();