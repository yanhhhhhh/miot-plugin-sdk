import { Device } from 'miot';

export const GSNoop = {}; // 空对象
export const isNoop = (obj) => {
  if (!obj || Object.keys(obj).length == 0) {
    return true;
  }
  return false;
};
export const GSNoopFun = () => {}; // 空函数

/**
 * 设备相关信息
 */
export const CucoDevice = {
  model: 'ivtec.acpartner.p7pro', // 'cuco.acpartner.cp2pro',
  did: Device.deviceID
};

/** urls
 */
export const MIUrls = {
  // 跳转到原声控制页面，Debug模式不可用
  irdevice_controllers_url: '/v2/irdevice/controllers'
};

/**
 * 红外线控制 urls
 */
export const IRUrls = {
  // 获取空调的某个品牌的控制keys
  getBrandsControlFunc: (brand) => {
    return `https://cdn.cnbj1.fds.api.mi-img.com/irservice/match/v2/category/5/brand/${ brand }`;
  }
};
