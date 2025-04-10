/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-08 11:40:12 
 */

import { ACStateCenter } from "../manager/DeviceManager/GSACStateCenter";
import { GSLocalize, isCurrentEnglish } from "../manager/LanguageManager/LanguageManager";
// 空调开关
export const ACPower = {
  on: {
    'name': 'power on',
    value: true
  },

  off: {
    'name': 'power off',
    value: false
  }
};

// 风速
export const WIND = {
  'auto': {
    name: GSLocalize("acid16"),
    value: 0,
    upper: 'Auto'
  },

  'low': {
    name: GSLocalize("acid17"),
    value: 1,
    upper: 'Low'
  },

  'middle': {
    name: GSLocalize("acid18"),
    value: 2,
    upper: 'Middle'
  },

  'high': {
    name: GSLocalize("acid19"),
    value: 3,
    upper: 'High'
  },

  title: (val) => {
    let res = '';
    Object.values(WIND).map((value) => {
      if (typeof (value) === 'object' && !!value.name && value.value === val) {
        res = value.name;
      }
    });
    return res;
  },

  type: (val) => {
    let res = WIND.auto;
    Object.values(WIND).map((value) => {
      if (typeof (value) === 'object' && value.value === val) {
        res = value;
      }
    });
    return res;
  },

  upperName: (val) => {
    let res = WIND.auto;
    Object.values(WIND).map((obj) => {
      if (typeof (obj) === 'object' && obj.value === val) {
        res = obj.upper;
      }
    });
    return res;
  }
};


// 模式 制冷，制热，自动，送风，除湿 
export const ACMode = {
  'cold': {
    name: GSLocalize("acid22"),
    value: 0,
    upper: 'Cold'
  },

  'heat': {
    name: GSLocalize("acid23"),
    value: 1,
    upper: 'Heat'
  },

  'auto': {
    name: GSLocalize("acid24"),
    value: 2,
    upper: 'Auto'
  },

  'wind': {
    name: GSLocalize("acid25"),
    value: 3,
    upper: 'Wind'
  },

  'wet': {
    name: GSLocalize("acid26"),
    value: 4,
    upper: 'Wet'
  },

  mode: (index) => {
    let res = ACMode.cold;
    Object.values(ACMode).map((value) => {
      if (typeof (value) === 'object' && value.value === index) {
        res = value;
      }
    });
    return res;
  },

  title: (val) => {
    let res = '';
    Object.values(ACMode).map((value) => {
      if (typeof (value) === 'object' && !!value.name && value.value === val) {
        res = value.name;
      }
    });
    return res;
  }
};

// 模式-温度-速度 指令下发
/**
 * P开关+M模式+T温度+S速度+W扫风
 * P开关: 0:关 1:开
 * M模式： 0:制冷 1:制热 2:自动 3:送风 4:除湿
 * T温度： 16-30
 * S速度： 0: 自动 1:低 2:中 3:高
 * W扫风： 0:关，1:开启
 * 每个指令以字符 _ 分割 如： M0_T16_S1
 * P0_M0_T26_S1_W0
 */
export const ACControlVAL = {
  P: {
    K: 'P',
    V: 0,
    DV: 0 // default value
  },

  M: {
    K: 'M',
    V: 0,
    DV: 0 // default value
  },
    
  T: {
    K: 'M',
    V: 26,
    DV: 26 // default value
  },

  S: {
    K: 'S',
    V: '0',
    DV: '0' // default value
  },

  W: {
    K: 'M',
    V: 0,
    DV: 0 // default value
  }
};

/**
 * 
 * @param {*} command String  P0_M0_T26_S1_W0
 */
export const generateACControlVAL = (command:String) => {
  command.split('_');
  ACStateCenter.controlValue;

};

// 星期
export const WEEK = {
  SUN: {
    index: 0,
    en: 'SUN',
    en_full: 'Sunday',
    zh: '周日',
    des: isCurrentEnglish() ? 'SUN' : '周日'
  },

  MON: {
    index: 1,
    en: 'MON',
    en_full: 'Monday',
    zh: '周一',
    des: isCurrentEnglish() ? 'MON' : '周一'
  },

  TUE: {
    index: 2,
    en: 'TUE',
    en_full: 'Tuesday',
    zh: '周二',
    des: isCurrentEnglish() ? 'TUE' : '周二'
  },

  WED: {
    index: 3,
    en: 'WED',
    en_full: 'Wednesday',
    zh: '周三',
    des: isCurrentEnglish() ? 'WED' : '周三'
  },

  THU: {
    index: 4,
    en: 'THU',
    en_full: 'Thursday',
    zh: '周四',
    des: isCurrentEnglish() ? 'THU' : '周四'
  },

  FRI: {
    index: 5,
    en: 'FRI',
    en_full: 'Friday',
    zh: '周五',
    des: isCurrentEnglish() ? 'FRI' : '周五'
  },

  SAT: {
    index: 6,
    en: 'SAT',
    en_full: 'Saturday',
    zh: '周六',
    des: isCurrentEnglish() ? 'SAT' : '周六'
  },

  dayOfIndex: (index) => {
    let res = WEEK.SUN;
    Object.values(WEEK).map((value) => {
      if (typeof (value) === 'object' && value.index === index) {
        res = value;
      }
    });
    return res;
  }
};