/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-11 10:54:06 
 */

import { ACControlVAL } from "../../constants/airconditioner";
import { GSDevWarn } from "../../helper/GSLog";
import { LocalStorageKeys, LocalStorageMgr } from "../LocalStorageManager/LocalStorageManager";

export const ACStateCenter = {

  /**
    * 根据是否有 controller_id  和  品牌名称 同时成立作为配码成功条件
    * true  配码成功 ,false 配码失败
    */
  isHadConfigControllId: async() => {
    try {
      let controllerIdAndBrand = await LocalStorageMgr.get(LocalStorageKeys.controlIdAndBrandId);
      if (!controllerIdAndBrand || !controllerIdAndBrand.controller_id || !controllerIdAndBrand.brand_id) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  },


  /**
     * 移除控制器ID 和商品名称
     */
  removeControllId: () => {
    LocalStorageMgr.remove(LocalStorageKeys.controlIdAndBrandId);
  },

  /**
     *  P0_M0_T26_S1_W0
     */
  controlValue: () => { 
    let value = LocalStorageMgr.get(LocalStorageKeys.ACControlValue);
    if (!value) { // 设置默认值
      LocalStorageMgr.set(ACControlVAL);
      value = ACControlVAL;
    }
    // 更新当前的控制状态
    ACControlVAL.P = value.P;
    ACControlVAL.M = value.M;
    ACControlVAL.T = value.T;
    ACControlVAL.S = value.S;
    ACControlVAL.W = value.W;
    return ACControlVAL;
  },

  /**
     * 
     * @param {*} val  ACControlVAL
     */
  setControlValue(val:ACControlVAL) { 
    ACControlVAL.P = val.P;
    ACControlVAL.M = val.M;
    ACControlVAL.T = val.T;
    ACControlVAL.S = val.S;
    ACControlVAL.W = val.W;
    LocalStorageMgr.set(LocalStorageKeys.ACControlValue, ACControlVAL);
  },

  /**
     *  设置一个 value 给 mode 注意： mode 只能是: P/M/T/S/W
     */
  setControlValForMode(value, mode) { 
    try {
      ACControlVAL[mode].V = value;
      LocalStorageMgr.set(LocalStorageKeys.ACControlValue, ACControlVAL); 
    } catch (error) {
      GSDevWarn({ error });    
    }
  }
    
};