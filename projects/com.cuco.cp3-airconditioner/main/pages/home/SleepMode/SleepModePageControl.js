/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-25 11:43:42 
 */

import Service from "miot/Service";
import { GSSpec } from "../../../constants";
import { ACMode, WEEK } from "../../../constants/airconditioner";
import { GSNoopFun } from "../../../constants/constant";
import { GSSetSpecResone, GSSetSpecResults } from "../../../constants/protocol/spec";
import { GSLocalize } from "../../../manager/LanguageManager/LanguageManager";
import { GSDeivce } from "../../../models/device";
import { HomePagePannelControl } from "../HomePagePannelControl";


class ISleepModePageControl {
  constructor() {
    this.on = true;
    this.repeats = [0, 1, 2, 3, 4, 5, 6];
    this.startTime = 23 * 60;
    this.endTime = 7 * 60;
    this.fanSpeed = 0;
    this.swingEnable = true;
    this.afterSleepState = 1; // 0:立即关闭 , 1:保持现状, 2: 延迟关闭
    this.delayTime = 10, // 表示延迟多少分钟关闭 范围[1, 59]
    this.beginTemp = 26;
    this.middleTemp = 26;
    this.endTemp = 26;
    this.onUpdatePage = GSNoopFun;
    this.windValue = 0;
    this.mannulControlling = false;
  }

    windSpeeds = () => {
      let coldFeature = HomePagePannelControl.getModeInfo(ACMode.cold.value);
      if (coldFeature) {
        return coldFeature.speeds;
      }
      return undefined;
    }

    tempsRange = () => {
      let coldFeature = HomePagePannelControl.getModeInfo(ACMode.cold.value);
      if (coldFeature) {
        return coldFeature.temps;
      }
      return undefined;
    }

    changeMintesToArray = (minutes) => {
      let hour = parseInt(minutes / 60);
      if (hour > 23) {
        hour = hour % 23;
      }
      let minute = parseInt(minutes % 60);
      return [hour, minute];
    }

    changeMintesToTimeStr = (minutes) => {
      let hour = parseInt(minutes / 60);
      if (hour > 23) {
        hour = hour % 23;
      }
      let minute = parseInt(minutes % 60);
        
      let hourPart = `${ hour }`;
      if (hourPart < 10) {
        hourPart = `0${ hour }`;
      }

      let minutePart = `${ minute }`;
      if (minutePart < 10) {
        minutePart = `0${ minute }`;
      }
      return `${ hourPart }:${ minutePart }`;
    }

    changeArrayToMinutes = (timeArr) => {
      if (!timeArr || timeArr.length == 0) {
        return 0;
      }
      if (timeArr.length == 1) {
        return parseInt(timeArr[0]);
      } else {
        return parseInt(timeArr[0]) * 60 + parseInt(timeArr[1]);
      }
    }

    textsOfRepeat = (custom = []) => {
      if (custom.length == 0) {
        return GSLocalize('acid72'); // 执行一次
      } else if (custom.length == 7) {
        return GSLocalize("acid78"); // 每天
      } else if (custom.length == 2 && custom[0] == 0 && custom[1] == 6) { // 周末
        return GSLocalize("acid79");
      } else if (custom.length == 5 && custom[0] == 1 && custom[1] == 2 && custom[2] == 3 && custom[3] == 4 && custom[4] == 5) { // 工作日
        return GSLocalize("acid77");
      }
      // 自定义
      let result = '';
      custom.map((val) => {
        let day = WEEK.dayOfIndex(val);
        result = `${ result + day.des } `;
      });
      return result;
    }

    repeatsOfType = (type) => {
      if (type == -1) { // 执行一次
        return [];
      } else if (type == 0) { // 每天
        return [0, 1, 2, 3, 4, 5, 6];
      } else if (type == 1) { // 工作日
        return [1, 2, 3, 4, 5];
      } else { // 周末
        return [0, 6];
      }
    }

    /**
     * [
     * {"code": 0, "did": "539093908", "duration": 392, "exe_time": 0, "piid": 1, "siid": 9, "start": 1643090578293, "updateTime": 1643090578,
     *  "value": false},
     *  {"code": 0, "did": "539093908", "duration": 392, "exe_time": 0, "piid": 2, "siid": 9, "start": 1643090578293, "updateTime": 1643090578,
     *  "value": "0;1439;20;20;20;7,1,2,3,4,5,6;1;1;2;50"}]
     */
    getAllSleepStates = async() => {
      let res = await this.sepcGetAllSleepValues();
      if (res.success) {
        let values = res.value;
        let results = {};
        values.map((val) => {
          const { success, siid, piid, value } = val;
          if (!!success && siid == GSSpec.siid9.status.siid && piid == GSSpec.siid9.status.piid) {
            results['on'] = value;
          } else if (!!success && siid == GSSpec.siid9.model_info.siid && piid == GSSpec.siid9.model_info.piid) {
            let vals = value.split(';');
            results['startTime'] = parseInt(`${ vals[0] }`); 
            results['endTime'] = parseInt(`${ vals[1] }`);
            results['beginTemp'] = parseInt(`${ vals[2] }`);
            results['middleTemp'] = parseInt(`${ vals[3] }`);
            results['endTemp'] = parseInt(`${ vals[4] }`);
            let repeats = vals[5].split(',').map((val) => parseInt(val % 7));
            results['repeat'] = repeats; // 重复
            results['willRepeats'] = repeats; // 重复
            results['windValue'] = parseInt(`${ vals[6] }`); // 风速
            results['swingEnable'] = parseInt(`${ vals[7] }`) == 1; // 扫风
            results['afterSleepState'] = parseInt(`${ vals[8] }`); // 结束状态
            results['delayTime'] = parseInt(`${ vals[9] }`); // 结束延迟时间
          }
        });
        if (Object.keys(results).indexOf('on') !== -1 && Object.keys(results).indexOf('startTime') !== -1) {
          this.onUpdatePage(results);
        } else {
          this.onUpdatePage({});
        }
      }
    }

    sepcGetAllSleepValues = () => {
      console.log('=======sepcGetAllSleepValues======');
      let promise = new Promise((resolve, reject) => {
        const { siid: s0, piid: p0 } = GSSpec.siid9.status; // 开关
        const { siid: s1, piid: p1 } = GSSpec.siid9.model_info; // 持续时间            
        let params = [{ did: GSDeivce.did, siid: s0, piid: p0 },
          { did: GSDeivce.did, siid: s1, piid: p1 }];
        Service.spec.getPropertiesValue(params).then((res) => {
          console.log('======== sepcGetAllSleepValues', res);
          resolve(GSSetSpecResults(res));
        }).catch((error) => {
          resolve({ success: false, value: undefined });
        });
      });
      return promise;
    }

    /**
     * 设置 安睡模式开关 
     */
    sepcSetOn = (value) => {
      console.log('=======sepcGetAllSleepValues======');
      let promise = new Promise((resolve, reject) => {
        const { siid: s0, piid: p0 } = GSSpec.siid9.status; // 开关         
        let params = [{ did: GSDeivce.did, siid: s0, piid: p0, value }];
        Service.spec.setPropertiesValue(params).then((res) => {
          console.log('======== sepcSetOn', res);
          resolve(GSSetSpecResone(res));
        }).catch((error) => {
          resolve(GSSetSpecResone(false));
        });
      });
      return promise;
    }
    /**
  on: SleepModePageControl.on,
      startTime: SleepModePageControl.startTime,
      endTime: SleepModePageControl.endTime,
      willStartTime: SleepModePageControl.startTime,
      willEndTime: SleepModePageControl.endTime,
      beginTemp: SleepModePageControl.beginTemp,
      middleTemp: SleepModePageControl.middleTemp,
      endTemp: SleepModePageControl.endTemp,
      repeats: SleepModePageControl.repeats,
      swingEnable: SleepModePageControl.swingEnable,
      windValue: SleepModePageControl.windValue,
      afterSleepState: SleepModePageControl.afterSleepState,
      delayTime: SleepModePageControl.delayTime,
      showToast: false,
 */
    specSetConfigs = (state) => {
      let promise = new Promise((resolve, reject) => {
        let { startTime, endTime, beginTemp, middleTemp, endTemp, repeats, windValue, swingEnable, afterSleepState, delayTime } = state;
        let repeatsStr = '';
        if (repeats.length > 0) {
          repeats.map((val, index) => {
            repeatsStr = `${ repeatsStr }${ (val != 0 ? val : 7) }`;
            if (index != repeats.length - 1) {
              repeatsStr = `${ repeatsStr },`;
            }
          });
        }
        if (afterSleepState != 2) {
          delayTime = 0;
        }
        let value = `${ startTime };${ endTime };${ beginTemp };${ middleTemp };${ endTemp };${ repeatsStr };${ windValue };${ swingEnable ? 1 : 0 };${ afterSleepState };${ delayTime }`;
        console.log('======== value value ddd', value);
        const { siid: s1, piid: p1 } = GSSpec.siid9.model_info; // 持续时间            
        let params = [{ did: GSDeivce.did, siid: s1, piid: p1, value }];
        Service.spec.setPropertiesValue(params).then((res) => {
          console.log('======== specSetConfigs', res);
          resolve(GSSetSpecResone(res));
        }).catch((error) => {
          resolve(GSSetSpecResone(false));
        });
      });
      return promise;
    }

}

export const SleepModePageControl = new ISleepModePageControl();