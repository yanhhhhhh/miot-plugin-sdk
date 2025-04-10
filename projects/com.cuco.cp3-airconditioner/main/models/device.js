/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-08 14:40:26 
 */

import { Device } from "miot";
import { DeviceConfig } from "../configuration";
import { LocalStorageKeys, LocalStorageMgr } from "../manager/LocalStorageManager/LocalStorageManager";

/**
 * 设备
 */
export const GSDeivce = {
  model: DeviceConfig.model, // 设备model
  did: Device.deviceID, // 设备id
  name: Device.name, // 设备名
  irConroller: {
    id: ''
  },

  brand: {
    id: '',
    name: ''
  },

  updateControllIdAndBrandIdFromLocal: async() => {
    let controllerIdAndBrand = await LocalStorageMgr.get(LocalStorageKeys.controlIdAndBrandId);
    GSDeivce.irConroller.id = controllerIdAndBrand.controller_id;
    GSDeivce.brand.id = controllerIdAndBrand.brand_id;
  }

};