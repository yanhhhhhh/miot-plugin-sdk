/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-20 15:08:23 
 */

import { Device } from "miot";
import { DeviceEvent } from "miot/device/BasicDevice";
import Service from "miot/Service";
import { IScene, SceneType } from "miot/service/scene";
import { GSSpec } from "../../constants";
import { ACMode, WIND } from "../../constants/airconditioner";
import { GSNoopFun } from "../../constants/constant";
import { GSSetSpecSuccess } from "../../constants/protocol/spec";
import { DateManagerMgr } from "../../helper/date/date";
import { GSDevWarn } from "../../helper/GSLog";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";
import { LocalStorageKeys, LocalStorageMgr } from "../../manager/LocalStorageManager/LocalStorageManager";
import { GSDeivce } from "../../models/device";

class IHomePagePannelControl {

  constructor() {
    this.mode = ACMode.cold.value; // 空调模式：默认制冷
    // 不支持的状态： {"default": false, "swing": {"directs": null, "type": 0}}
    this.features = { // 默认的features
      "default": true,
      "swing": { "type": 2, "directs": [1] }, // type：0 表示不支持扫风，1支持定向风，2，支持定向风&扫风
      "modes": [
        { "mode": 0, "temps": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], "speeds": [0, 1, 2, 3] },
        { "mode": 1, "temps": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], "speeds": [0, 1, 2, 3] },
        { "mode": 2, "speeds": [0, 1, 2, 3] },
        { "mode": 3, "temps": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], "speeds": [0, 1, 2, 3] },
        { "mode": 4, "temps": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], "speeds": [1] }]
    };
    this.unsupportControllerId = false;
    this.defaultTempValue = -1;
    this.onUpdatePannel = GSNoopFun;
    this.defaultTempsRange = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    this.windValue = WIND.auto.value;
    this.defaultWindTypes = [WIND.auto.value, WIND.low.value, WIND.middle.value, WIND.high.value];
    this.defaultModes = [ACMode.cold.value, ACMode.heat.value, ACMode.auto.value, ACMode.wind.value, ACMode.wet.value];
    this.defaultPanelBrightnessEnable = true;
    this.sleepModeOn = false;
    this.timingOn = false;
    this.comfyModeOn = false;
    this.supportPannelLight = true;
    this.fastColdOn = false;
    this.onTimeControlVal = { on: false, value: '' };
    this.onDelayControlVal = { on: false, value: '' };
    this.deviceName = Device.name;
    this.stopDeviceEventState = false;
    // 监听设备信息。
    Device.getDeviceWifi().subscribeMessages('prop.deviceValues',
      GSSpec.propVAL(GSSpec.siid3.on),
      GSSpec.propVAL(GSSpec.siid3.target_temperature),
      GSSpec.propVAL(GSSpec.siid3.mode),
      GSSpec.propVAL(GSSpec.siid4.on),
      GSSpec.propVAL(GSSpec.siid4.fan_level),
      GSSpec.propVAL(GSSpec.siid12.led_status),
      GSSpec.propVAL(GSSpec.siid9.status),
      GSSpec.propVAL(GSSpec.siid12.support_key),
      GSSpec.propVAL(GSSpec.siid8.status),
      GSSpec.propVAL(GSSpec.siid12.control_id), // 监听控制ID变化。
    ).then((subscribe) => {
      this.subscribe = subscribe;
    }).catch((res) => { });

    this.deviceEvent = DeviceEvent.deviceReceivedMessages.addListener((device, map, data) => {
      if (this.stopDeviceEventState) { // 手动控制中。3秒不做过来的数据
        this.tempDeviceEventData = data;
        return;
      }
      this.didReceiveDeviceInfo(data);
    });

    this.deviceInfoEvent = DeviceEvent.deviceNameChanged.addListener((device) => {
      this.onUpdatePannel({
        deviceName: device.name
      });
    });
  }

  // 设备信息变化。  [{"did": "482357472", "key": "prop.7.1", "time": 1648090371, "value": [0]}]
  didReceiveDeviceInfo = (data) => {
    if (!data || data.length == 0) {
      return;
    }
    let values = [];
    data.map((res) => {
      let keyInfo = res.key.split('.');
      if (keyInfo.length === 3) {
        try {
          let siid = parseInt(keyInfo[1]);
          let piid = parseInt(keyInfo[2]);
          let value = res.value[0];
          values.push({ success: true, siid, piid, value });
        } catch (error) { }
      }
    });
    let results = this.analysisToHomePannel(values);
    let generateValues = {};
    if (Object.keys(results).indexOf('mode') !== -1) {
      generateValues = this.generateDataByMode();
    }
    let newResult = { ...results, ...generateValues };
    if (Object.keys(newResult).length != 0) {
      console.log('==========onUpdatePannel============: ', JSON.stringify(newResult));
      this.onUpdatePannel(newResult);
    }

    // 检查是否： 控制ID 发生变化。
    let newControlId = -1;
    values.map((val) => {
      const { siid, piid, value } = val;
      if (siid == GSSpec.siid12.control_id.siid && piid == GSSpec.siid12.control_id.piid) {
        newControlId = value;
      }
    });
    if (newControlId != -1) {
      GSIRAirconditionerMgr.getControllerIdAndBrandIdFromServer();
    }
  }

  removeListener() {
    !!this.subscribe && this.subscribe.remove();
    !!this.deviceEvent && this.deviceEvent.remove();
    !!this.timer && clearInterval(this.timer);
    !!this.deviceInfoEvent && this.deviceInfoEvent.remove();
    !!this.stopDeviceEvent && clearTimeout(this.stopDeviceEvent);
  }

  /** 格力
   * {"result":{"swing":{"type":2,"directs":[1]},"modes":
   * [{"mode":0,"temps":[16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[0,1,2,3]},
   * {"mode":1,"temps":[16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[0,1,2,3]},
   * {"mode":2,"speeds":[0,1,2,3]},
   * {"mode":3,"temps":[16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[0,1,2,3]},
   * {"mode":4,"temps":[16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[1]}]},
   * "message":"ok",
   * "code":0,"__api_info":{"duration":195,"start":1642662858701}}
   */

  /** 美的
   * {"result":
   * {"swing":{"type":2,"directs":[1]},
   * "modes":[{"mode":0,"temps":[17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[0,1,2,3]},
   *          {"mode":1,"temps":[17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[0,1,2,3]},
   *          {"mode":2,"temps":[17,18,19,20,21,22,23,24,25,26,27,28,29,30]},
   *          {"mode":3,"speeds":[0,1,2,3]}, 
   *          {"mode":4,"temps":[17,18,19,20,21,22,23,24,25,26,27,28,29,30]}]},
   *         "message":"ok","code":0,"__api_info":{"duration":203,"start":1642839767372}}
   */
  // 初始化，获取空调有哪些功能，优先从本地存储获取
  initAirInfo = async() => {
    try {
      let localFeatures = await LocalStorageMgr.get(LocalStorageKeys.ACFeaturesFromControlId);
      this.updatePannelFeatures(localFeatures);
    } catch (error) { /** 使用默认 */ }
  }

  /**
 * 控制器发生变化，更新控制面板。
 */
  onControlIdChange = (newControlId) => {
    this.updatePannelFeatures(); // 更新 pannel
  }

  updatePannelFeatures = async(local = undefined) => {
    let respone = local;
    if (!local) {
      respone = await GSIRAirconditionerMgr.getAcFeatures();
    }
    // 只有有值，才去设置。
    if (respone['code'] == 0 && !!respone['result']) {
      LocalStorageMgr.set(LocalStorageKeys.ACFeaturesFromControlId, respone);
      let result = respone['result'];
      this.features = { "default": false, ...result };
      console.log('============current features: ', this.features);
      this.updateMode(this.mode);
    }
  }

  /**
   * 更新Mode
   */
  updateMode = (mode) => {
    this.mode = mode;
    let values = this.generateDataByMode();
    this.onUpdatePannel(values);
  }

  generateDataByMode = () => {
    let values = {};
    // console.log('=============this.features.modes: ', this.features.modes);
    !!this.features.modes && this.features.modes.map((val) => {
      if (val.mode == this.mode) {
        values = val;
      }
    });
    this.unsupportControllerId = !this.features.modes ? true : false;
    return { unsupportControllerId: this.unsupportControllerId, swing: this.features.swing, ...values, temps: values['temps'], speeds: values['speeds'], windValue: this.windShowValue(this.windValue) };
  }

  getPannelData = () => {
    return this.generateDataByMode();
  }

  temControlRange = (temps: Array) => {
    if (!temps || temps.length < 2) {
      if (!this.lastTempsRange || this.lastTempsRange.length == 0) {
        this.lastTempsRange = this.defaultTempsRange;
      }
    } else {
      this.lastTempsRange = temps;
    }
    return this.lastTempsRange;
  }

  // 获取当前空调所有的状态和数据
  refreshAllAcControlStates = async() => {
    // 获取插件当前空调的状态。
    let res = await GSIRAirconditionerMgr.getAcStateValues();
    if (res.success) {
      let values = res.value;
      let results = this.analysisToHomePannel(values);
      let generateValues = this.generateDataByMode();
      let newResult = { ...results, ...generateValues };
      console.log('==========onUpdatePannel0============: ', JSON.stringify(newResult));
      if (Object.keys(newResult).length != 0) {
        this.onUpdatePannel(newResult);
      }
    }
  }

  analysisToHomePannel = (values) => {
    let results = {};
    values.map((val) => {
      const { success, siid, piid, value } = val;
      if (!!success && siid == GSSpec.siid3.on.siid && piid == GSSpec.siid3.on.piid) {
        results['powerOn'] = value;
      } else if (!!success && siid == GSSpec.siid3.target_temperature.siid && piid == GSSpec.siid3.target_temperature.piid) {
        results['tempValue'] = value;
      } else if (!!success && siid == GSSpec.siid3.mode.siid && piid == GSSpec.siid3.mode.piid) {
        results['mode'] = value;
        this.mode = value;
      } else if (!!success && siid == GSSpec.siid4.on.siid && piid == GSSpec.siid4.on.piid) {
        results['swingOn'] = value;
      } else if (!!success && siid == GSSpec.siid4.fan_level.siid && piid == GSSpec.siid4.fan_level.piid) {
        results['windValue'] = this.windShowValue(value);
      } else if (!!success && siid == GSSpec.siid12.led_status.siid && piid == GSSpec.siid12.led_status.piid) {
        results['penelBrightnessEnable'] = value;
      } else if (!!success && siid == GSSpec.siid9.status.siid && piid == GSSpec.siid9.status.piid) {
        results['sleepModeOn'] = value;
      } else if (!!success && siid == GSSpec.siid12.support_key.siid && piid == GSSpec.siid12.support_key.piid) {
        let subStrs = value.split('&');// led=0&wind=1
        if (subStrs.length == 2) {
          let targetStr = '';
          if (subStrs[0].indexOf('led') !== -1) {
            targetStr = subStrs[0];
          } else if (subStrs[1].indexOf('led') !== -1) {
            targetStr = subStrs[1];
          }
          if (targetStr !== '') {
            results['supportPannelLight'] = parseInt(targetStr.split('=')[1]);
          }
        }
      } else if (!!success && siid == GSSpec.siid8.status.siid && piid == GSSpec.siid9.status.piid) {
        results['fastColdOn'] = value;
      }
    });
    return results;
  }

  // 获取显示的风速
  windShowValue = (value = undefined) => {
    try {
      let speeds: Array = this.getModeInfo(this.mode).speeds;
      if (!speeds || speeds.length == 0) {
        return undefined;
      }
      if (value == undefined || speeds.indexOf(value) == -1) {
        return speeds[0];
      }
      this.windValue = value;
      return this.windValue;
    } catch (error) { }
  }

  // 获取mode下面对应的信息 {"mode":0,"temps":[17,18,19,20,21,22,23,24,25,26,27,28,29,30],"speeds":[0,1,2,3]},
  getModeInfo = (mode) => {
    let info = undefined;
    !!this.features.modes && this.features.modes.map((val) => {
      if (val.mode == mode) {
        info = val;
      }
    });
    return info;
  }

  getModesFromFeatures = () => {
    if (!this.features.modes || this.features.modes.length == 0) {
      return [];
    }
    let res = [];
    this.features.modes.map((val) => {
      res.push(val.mode);
    });
    return res;
  }

  // 更新速冷模式的状态
  updateFastCodeState = (val) => {
    this.onUpdatePannel({ 'fastColdOn': val });
  }

  /** ****************************************************************
   *************************** spec 控制指令 ***************************
   ****************************************************************** */

  // 设置控制模式
  specSetMode = async(mode) => {
    let res = await GSIRAirconditionerMgr.setMode(mode);
    console.log(`======== specSetMode: ${ mode } result:`, res);
    if (res) {
      this.updateMode(mode);
    }
  }

  // 开关机
  specSetPowerOn = async(enable) => {
    let res = await GSIRAirconditionerMgr.setPowerOn(enable);
    console.log(`======== specSetPowerOn: ${ enable } result:`, res);
    if (res) {
      this.onUpdatePannel({ 'powerOn': enable });
    }
  }

  // 设置温度
  specSetTemp = async(val) => {
    let res = await GSIRAirconditionerMgr.setTemp(val);
    console.log(`======== specSetTemp: ${ val } result:`, res);
    if (res) {
      this.onUpdatePannel({ 'tempValue': val });
    }
  }

  // 扫风开关
  specSetSwingOn = async(enable) => {
    let res = await GSIRAirconditionerMgr.setSwingOn(enable);
    console.log(`======== specSetSwingOn: ${ enable } result:`, res);
    if (res) {
      this.onUpdatePannel({ 'swingOn': enable });
    }
  }

  // 判断当前是否有扫风功能
  isHadSwingFeature = () => {
    let features = this.getPannelData();
    if (!!features.swing && features.swing.type == 2) {
      return true;
    }
    return false;
  }


  // 设置风速
  specSetWindValue = async(val) => {
    let res = await GSIRAirconditionerMgr.setWindValue(val);
    console.log(`======== specSetWindValue: ${ val } result:`, res);
    if (res) {
      this.onUpdatePannel({ 'windValue': val });
    }
  }

  // 设置面板灯光
  specSetPanelBrightnessEnable = async(enable) => {
    let res = await GSIRAirconditionerMgr.setPanelBrightnessEnable(enable);
    console.log(`======== specSetPanelBrightnessEnable: ${ enable } result:`, res);
    if (res) {
      this.onUpdatePannel({ 'penelBrightnessEnable': enable });
    } else { // 失败恢复
      this.onUpdatePannel({ 'penelBrightnessEnable': !enable });
    }
  }

  // 定时获取
  getTiming = async() => {
    // 拉取服务器的节假日
    if (!this.lastFreeWorkYear || parseInt(DateManagerMgr.getCurrentDateNew[0]) !== parseInt(this.lastFreeWorkYear)) {
      try { 
        let res = await Service.callSmartHomeAPI('/v2/public/get_weekday_info', {
          'year': new Date().getFullYear(),
          'country': 'cn'
        });
        this.workday = res.workday;
        this.freeday = res.freeday;
        this.lastFreeWorkYear = res.year;
      } catch (error) {}
    }
    console.log('============', { year: this.lastFreeWorkYear, freeday: this.freeday, workday: this.workday });
  
    Service.scene.loadTimerScenes(GSDeivce.did).then((scenes) => {
      let timers = [];
      scenes.map((scene) => {
        // identify_1: 定时控制空调    custom: 延迟关空调
        if (scene.type === SceneType.Timer && (scene.identify === 'custom' || scene.identify === 'identify_1')) {
          let iScene = { identify: scene.identify, setting: scene.setting };
          timers.push(iScene);
        }
      });
      this.sceneTimers = timers;
      this.onUpdateSceneTimers();
      this.onAwakeRefreshTimer();
    }).catch((err) => {
      console.log('===== getTiming err', err);
    });
  }

  onAwakeRefreshTimer = () => {
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.onUpdateSceneTimers();
      }, 60 * 1000);
    }
  }

  onUpdateSceneTimers = () => {
    let onTimeVal = { on: false, value: '' };
    let onDelayVal = { on: false, value: '' };
    let currentTimers = this.sceneTimers ? this.sceneTimers : [];
    // ----- 定时
    /**
     * 
     *{"enable_timer_off":"0","off_time":"2 14 25 3 *","enable_timer_on":"1","on_time":"56 10 26 3 *","enable_timer":"1","on_filter":"","off_filter":""}
      {"enable_timer_off":"1","off_time":"43 14 25 3 *","enable_timer_on":"0","on_time":"28 14 25 3 *","enable_timer":"0","on_filter":"","off_filter":""}
      {"enable_timer_off":"1","off_time":"3 0 26 3 *","enable_timer_on":"1","on_time":"39 19 25 3 *","enable_timer":"1","on_filter":"","off_filter":""}
      {"enable_timer_off":"0","off_time":"39 14 * * 0,1,2,3,4,5,6","enable_timer_on":"1","on_time":"39 13 * * 0,1,2,3,4,5,6","enable_timer":"1","on_filter":"","off_filter":""}
      
      {"enable_timer_off":"1","off_time":"9 10 * * 0,1,2,3,4,5,6","enable_timer_on":"0","on_time":"41 14 * * 0,1,2,3,4,5,6","enable_timer":"1","on_filter":"cn_workday","off_filter":"cn_workday"}
     */
    let onTimeTimers = currentTimers.filter((scene) => scene.identify === 'identify_1');// 定时的。
    let target = { ts: 111650962340000, text: '' };
    onTimeTimers.map((scene) => {
      let setting = scene.setting;
      const { enable_timer_off, off_time, enable_timer_on, on_time, enable_timer, on_filter, off_filter } = setting;
      // console.log('---------', JSON.stringify({ enable_timer_off, off_time, enable_timer_on, on_time, enable_timer, on_filter, off_filter }));
      try {
        let isEnable = parseInt(enable_timer) === 0 ? false : true;
        onTimeVal.on = onTimeVal.on || isEnable;
        if (isEnable) { // 不需要处理 无效的 过滤掉 节假日。 // && on_filter === '' && off_filter === ''
          let onTarget = { ts: 0, text: '' };
          let offTarget = { ts: 0, text: '' };
          if (parseInt(enable_timer_off) === 1) { // 关闭
            offTarget = this.getClosestTs(off_time, GSLocalize('acid49'), off_filter);
          }
          if (parseInt(enable_timer_on) === 1) { // 打开
            onTarget = this.getClosestTs(on_time, GSLocalize('acid126'), on_filter);
          }
          if (onTarget.ts != 0 && offTarget.ts != 0) {
            let minTarget = offTarget.ts < onTarget.ts ? offTarget : onTarget; // 取最小
            target = minTarget.ts < target.ts ? minTarget : target; // 取最小
          } else if (onTarget.ts != 0) {
            target = onTarget.ts < target.ts ? onTarget : target; // 取最小
          } else if (offTarget.ts != 0) {
            target = offTarget.ts < target.ts ? offTarget : target; // 取最小
          }
        }
      } catch (error) { }
    });
    if (target.ts != 111650962340000) {
      onTimeVal.value = target.text;
      // console.log('========== MMMM ', {date: new Date(target.ts), ...target});
    } else {
      console.log('========== MMMM ======', -1);
    }
  
    // ----- 延迟关空调
    let delayCloseTimers = currentTimers.filter((scene) => scene.identify === 'custom');
    delayCloseTimers.map((scene) => { // //延迟关空调,延迟关空调只有一个场景。 
      let setting = scene.setting;
      const { enable_timer_off, on_time, off_time, enable_timer_on, enable_timer, on_filter, off_filter } = setting;
      try {
        onDelayVal.on = onDelayVal.on || (parseInt(enable_timer) === 0 ? false : true);
        let isOpen = parseInt(enable_timer_on) == 1;
        let title = isOpen ? '开启' : '关闭';
        let time: String = isOpen ? on_time : off_time; // 15 11 25 3 *
        let setTime = time.split(' ').filter((val) => val !== '*').map((val) => parseInt(val));
        let setMonth = setTime[3];
        let currentDate = DateManagerMgr.getCurrentDateNew();
        let currentMonth = parseInt(currentDate[1]);
        let currentYear = parseInt(currentDate[0]);
        let setYear = currentYear;
        if (setMonth < currentMonth) {
          setYear = setYear + 1;
        }
        let setTimestamp = (new Date(setYear, setMonth - 1, setTime[2], setTime[1], setTime[0], 0, 0)).getTime();
        let currentTimestamp = (new Date()).getTime();
        let dTimestamp = (setTimestamp - currentTimestamp) / 1000 + 60;
        let hour = parseInt(dTimestamp / 3600);
        let min = parseInt((dTimestamp / 60) % 60);
        let text = '';
        if (hour > 0) {
          text = `${ hour }${ GSLocalize('acid133') } `;
        }
        text = `${ text }${ min }${ GSLocalize('acid101') }${ title }`;
        onDelayVal.value = text;

        if (dTimestamp <= 60) {
          onDelayVal = { on: false, value: '' };
        }

      } catch (error) { }
    });
    this.onUpdatePannel({
      onTimeControlVal: onTimeVal,
      onDelayControlVal: onDelayVal
    });
  }

  // 周日到周一
  getWeakText = (index) => {
    index = index % 7;
    let texts = [GSLocalize('acid89'), GSLocalize('acid83'), GSLocalize('acid84'), GSLocalize('acid85'), GSLocalize('acid86'), GSLocalize('acid87'), GSLocalize('acid88')];
    return texts[index];
  }

  /**
   * 
   * @param {*} value : 时间
   * @param {*} controlStr : 控制开启或者关闭
   * @param {*} filter ： 过滤： '', 'cn_workday', 'cn_freeday'
   * @returns 
   */
  getClosestTs = (value, controlStr, filter) => {
    // 当前时间
    let current = new Date();
    let currentDate = DateManagerMgr.getCurrentDateNew(current);
    let currentYear = parseInt(currentDate[0]);
    let currentMonth = parseInt(currentDate[1]);
    let currentDay = parseInt(currentDate[2]);
    let currentHour = parseInt(currentDate[3]);
    let currentMinute = parseInt(currentDate[4]);
    // value.
    let offTimes = value.split(' ');

    // 目标执行时间
    let year = currentYear;
    let month = 0;
    let day = 0;
    let hour = parseInt(offTimes[1]);
    let minute = parseInt(offTimes[0]);
    let hourStr = hour < 10 ? `0${ hour }` : `${ hour }`;
    let minuteStr = minute < 10 ? `0${ minute }` : `${ minute }`;
    // 重复
    if (offTimes[2] === '*' && offTimes[3] === '*' && filter == '') { // 重复 ["56", "10", "*", "*", "0,1,2,3,4,5,6"]
      let repeats = offTimes[4]; // ["0,1,2,3,4,5,6"]
      let repeatVals = repeats.split(',').filter((val) => val !== '*').map((val) => parseInt(val));
      let todayIndex = DateManagerMgr.indexOfWeek(current);
      let minDVAL = 7;
      repeatVals.map((index) => {
        let d = 7;
        if (index < todayIndex) {
          d = index + 7 - todayIndex;
        } else if (index > todayIndex) {
          d = index - todayIndex;
        } else {
          let isOld = ((currentHour * 60 + currentMinute) - (hour * 60 + minute)) > 0;// 时间已经过了。
          d = isOld ? 7 : 0;
        }
        if (d < minDVAL) {
          minDVAL = d;
        }
      });
      let exeDate = new Date(currentYear, currentMonth - 1, currentDay, hour, minute);
      let exeDateTs = exeDate.getTime() + (minDVAL * 3600 * 24 * 1000);
      let weakIndex = DateManagerMgr.indexOfWeek(new Date(exeDateTs));
      let text = weakIndex == todayIndex ? `${ hourStr }:${ minuteStr }` : `${ this.getWeakText(weakIndex) } ${ hourStr }:${ minuteStr }`;
      if (repeatVals.length === 7) { // 每天
        text = `${ GSLocalize('acid131') } ${ hourStr }:${ minuteStr }`;
      }
      return { ts: exeDateTs, type: 'repeat', text: `${ text } ${ controlStr }` };
    } else if (filter === 'cn_workday' || filter === 'cn_freeday') { // 法定工作日或者法定节假日
      let ts = 0;
      let text = '';
      if (filter == 'cn_workday') {
        ts = this.getWorkDayColsest(hour, minute, current);
        text = GSLocalize('acid129');// '法定工作日';
      } else {
        ts = this.getFreeDayColsest(hour, minute, current);
        text = GSLocalize('acid128');// '法定节假日';
      }
      text = `${ text } ${ hourStr }:${ minuteStr }`; 
      return { ts: ts, type: filter, text: `${ text } ${ controlStr }` };
    } else { // 执行一次
      month = parseInt(offTimes[3]);
      day = parseInt(offTimes[2]);
      if (month == 1 && month < currentMonth) { // 跨年
        year = year + 1;
      }
      let setDate = new Date(year, month - 1, day, hour, minute);
      let ts = setDate.getTime();
      let result = ts < current.getTime() ? 0 : ts; // 如果过时的则返回 0
      let dayStr = '';
      if (month === currentMonth && day === currentDay) {
        dayStr = ''; // 今天
      } else if (DateManagerMgr.daysOff(setDate, current) === 1) {
        dayStr = GSLocalize('acid130'); // 次日
      } else {
        dayStr = `${ month }-${ day }`; // 具体时间
      }
      let text = dayStr === '' ? `${ hourStr }:${ minuteStr }` : `${ dayStr } ${ hourStr }:${ minuteStr }`;
      return { ts: result, type: 'date', text: `${ text } ${ controlStr }` };
    }
  }

  getWorkDayColsest = (exeHour, exeMinute, current:Date) => {
    let workDays50 = DateManagerMgr.getWorkDaysOfNext50days(current, this.workday, this.freeday);
    let currentDate = DateManagerMgr.getCurrentDateNew(current);
    let currentHour = parseInt(currentDate[3]);
    let currentMinute = parseInt(currentDate[4]);
    let currentStr = `${ currentDate[0] }${ currentDate[1] }${ currentDate[2] }`;
    let tWorkDay:String = workDays50[0]; 
    if (tWorkDay === currentStr && (((currentHour * 60 + currentMinute) - (exeHour * 60 + exeMinute)) > 0)) { // 今天时间已经过了。
      tWorkDay = workDays50[1]; 
    }
    // yyyymmdd
    let ts = new Date(parseInt(tWorkDay.substring(0, 4)), parseInt(tWorkDay.substring(4, 6)) - 1, parseInt(tWorkDay.substring(6, 8))).getTime();
    ts = ts + (exeHour * 60 + exeMinute) * 60 * 1000;
    return ts;
  }

  getFreeDayColsest = (exeHour, exeMinute, current:Date) => {
    let workDays50 = DateManagerMgr.getFreeDaysOfNext50days(current, this.workday, this.freeday);
    let currentDate = DateManagerMgr.getCurrentDateNew(current);
    let currentHour = parseInt(currentDate[3]);
    let currentMinute = parseInt(currentDate[4]);
    let currentStr = `${ currentDate[0] }${ currentDate[1] }${ currentDate[2] }`;
    let tWorkDay:String = workDays50[0]; 
    if (tWorkDay === currentStr && (((currentHour * 60 + currentMinute) - (exeHour * 60 + exeMinute)) > 0)) { // 今天时间已经过了。
      tWorkDay = workDays50[1]; 
    }
    // yyyymmdd
    let ts = new Date(parseInt(tWorkDay.substring(0, 4)), parseInt(tWorkDay.substring(4, 6)) - 1, parseInt(tWorkDay.substring(6, 8))).getTime();
    ts = ts + (exeHour * 60 + exeMinute) * 60 * 1000;
    return ts;
  }

  turnOnComfyMode = async() => {
    let result = await this.specTurnOnComfyMode();
    if (result) { // 成功刷新首页
      let values = { mode: ACMode.cold.value, tempValue: 28, swingOn: true };
      this.mode = ACMode.cold.value;
      let features = this.generateDataByMode();
      let newResult = { ...values, ...features };
      if (Object.keys(newResult).length != 0) {
        this.onUpdatePannel(newResult);
      }
    }
  }

  // 打开舒适模式
  specTurnOnComfyMode = () => {
    console.log('======== turnOnComfyMode ========= ');
    let promise = new Promise((resolve, reject) => {
      const { siid, aiid, parmas } = GSSpec.siid12.cozy_mode;
      let params = { did: GSDeivce.did, siid, aiid, in: parmas };
      Service.spec.doAction(params).then((res) => {
        console.log('======== turnOnComfyMode result: ', res);
        resolve(GSSetSpecSuccess(res));
      }).catch((error) => {
        console.log('======== turnOnComfyMode error: ', error);
        resolve(false);
      });
    });
    return promise;
  }


  /**
   * 实现手动控制时候后3秒不做监听数据变化。 
   */
  onDoMannulControlSemaphore = () => {
    this.stopDeviceEventState = true;
    this.tempDeviceEventData = null;
    if (this.stopDeviceEvent) {
      clearTimeout(this.stopDeviceEvent);
      this.stopDeviceEvent = null;
    }
    this.stopDeviceEvent = setTimeout(() => {
      this.stopDeviceEventState = false;
      if (this.tempDeviceEventData) {
        this.didReceiveDeviceInfo(this.tempDeviceEventData);
      }
    }, 3000);
  }
}

export const HomePagePannelControl = new IHomePagePannelControl();