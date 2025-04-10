/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-06 11:09:29 
 */

export const GSSpec = {

  propVAL: (obj) => {
    const { siid, piid } = obj;
    return `prop.${ siid }.${ piid }`;
  },

  // 继电器开关 (这个功能暂无)
  siid2: {
    // 继电器开关
    on: {
      siid: 2,
      piid: 1,
      name: 'on',
      value: false // 默认值false
    }
  },
  // air-conditioner 空调相关操作
  siid3: {
    // 空调开关
    on: {
      siid: 3,
      piid: 1,
      name: 'on',
      value: false, // 默认值false
      pVal: 'prop.3.1'
    },
    // 模式
    mode: {
      siid: 3,
      piid: 2,
      name: 'mode',
      value: 0, // 0 :制冷 1，制热，2，自动，3，送风，4,除湿
      pVal: 'prop.3.2'
    },
    // 设定温度
    target_temperature: {
      siid: 3,
      piid: 4,
      name: 'target-temperature',
      value: 16, // 16-32
      pVal: 'prop.3.4'
    },
    sleep_mode: {
      siid: 3,
      piid: 11,
      name: 'sleep-mode',
      value: false, // bool
      pVal: 'prop.3.11'
    }
  },
  
  // 扫风功能 开启，关闭
  siid4: {
    // 扫风  
    on: {
      siid: 4,
      piid: 1,
      name: 'on',
      value: false, // 默认值false
      pVal: 'prop.4.1'
    },
    // 风速
    fan_level: {
      siid: 4,
      piid: 2,
      name: 'fan-level',
      value: 0,
      pVal: 'prop.4.2' 
    }
  },

  // power-consumption  功耗参数1
  siid7: {
    // 耗电量
    power_consumption: {
      siid: 7,
      piid: 1,
      name: 'power-consumption',
      value: 0 // 默认值0, 范围 0 - 65535， 步长： 0.01
    },
    // 电流
    electric_current: {
      siid: 7,
      piid: 2,
      name: 'electric-current',
      value: 0 // 默认值0, 范围 0 - 65535， 步长： 0.1
    },
    // 电压
    voltage: {
      siid: 7,
      piid: 3,
      name: 'voltage',
      value: 0 // 默认值0, 范围 0 - 65535， 步长： 0.1
    },
    // 电功率
    electric_power: {
      siid: 7,
      piid: 6,
      name: 'electric_power',
      value: 0 // 默认值0, 范围 0 - 65535， 步长： 0.1
    }
  },
  // 开机速冷1
  siid8: {

    // 速冷模式开关
    status: {
      siid: 8,
      piid: 1,
      name: 'status',
      value: false // 默认值 false
    },
    // 速冷保存时间
    keep_time: {
      siid: 8,
      piid: 2,
      name: 'keep-time',
      value: 1 // 默认值 1
    }
  },
  // sleep-mode 安睡模式1
  siid9: {
    // 安睡模式开关
    status: {
      siid: 9,
      piid: 1,
      name: 'status',
      value: false // 默认值 false
    },

    // 安睡模式参数
    /** 构成： 开始时间 + 结束时间 + 开始温度 + 中间温度 + 结束温度 + 星期（多个星期以 (,)号隔开） + 风速 + 扫风 + 结束模式 + 延迟开关时间（保持现状和立即关闭延迟为0）
         * 1. 开始时间和结束时间以24小时分钟制 0 - 1439 == （00:00 ~ 23:59) 如： 720 = 12:00
         * 2. 星期 （7，1，2，3，4，5，6）
         * 3. 结束模式： 0:立即关闭 1:保持现状 2:延迟关闭
         * 4. 延迟开关时间 1-59分钟
         * 5. 温度范围： 16-30
         * 6. 每个属性以 ; 分隔
         * 例如： 0;1439;20;20;20;7,1,2,3,4,5,6;1;1;2;50
         */
    model_info: {
      siid: 9,
      piid: 2,
      name: 'model-info',
      value: '' // 默认值 ''
    }
  },
  // siid  (10)   indicator-light  继电器指示灯
  siid10: {
    // 指示灯开关
    status: {
      siid: 10,
      piid: 1,
      name: 'status',
      value: false // 默认值 false
    },

    // 勿扰模式开关
    model: {
      siid: 10,
      piid: 2,
      name: 'model',
      value: false // 默认值 false false/true
    },

    // 开始时间
    start_time: {
      siid: 10,
      piid: 3,
      name: 'start-time',
      value: 0 // 默认值 0   (0 - 1440) 步长： 1
    },

    // 结束时间
    end_time: {
      siid: 10,
      piid: 4,
      name: 'end-time',
      value: 0 // 默认值 0   (0 - 1440) 步长： 1
    }
  },
  // 报警推送
  siid11: {
    // 设备过载保护 开关
    overload: {
      siid: 11,
      piid: 1,
      name: 'overload',
      value: false // 默认值false
    },
    //	过温保护 开关
    temperature_high: {
      siid: 11,
      piid: 2,
      name: 'temperature-high',
      value: false // 默认值false
    }
  },
    
  // air condition info 空调控制参数
  siid12: {
    // 空调是否插在插座上
    is_insert_air: {
      siid: 12,
      piid: 1,
      name: 'is-insert-air',
      value: true // 默认值true
    },

    // 控制id
    control_id: {
      siid: 12,
      piid: 2,
      name: 'control-id',
      value: 0 // 默认值0（1 到 2147483647）
    },

    // 模式-温度-速度 指令下发
    /**
         * P开关+M模式+T温度+S速度+W扫风
         * P开关: 0:关 1:开
         * M模式： 0:制冷 1:制热 2:自动 3:送风 4:除湿
         * T温度： 16-30
         * S速度： 0: 自动 1:低 2:中 3:高
         * W扫风： 0:关，1:开启
         * 每个指令以字符 _ 分割 如： M0_T16_S1
         */
    model_temp_speed: {
      siid: 12,
      piid: 3,
      name: 'model-temp-speed',
      value: 'P0_M0_T26_S1_W0' // 默认值P0_M0_T26_S1_W0 （1 到 2147483647）
    },

    // 空调指示灯 打开/关闭
    led_status: {
      siid: 12,
      piid: 4,
      name: 'led-status',
      value: false, // 默认值false
      pVal: 'prop.12.4' 
    },

    // 支持功能获取
    support_key: {
      siid: 12,
      piid: 5,
      name: 'support-key',
      value: '' // 默认值 ''
    },

    // 控制id
    brand_id: {
      siid: 12,
      piid: 6,
      name: 'brand-id',
      value: 0 // 默认值0（1 到 2147483647）
    },

    // 舒适模式函数
    cozy_mode: {
      siid: 12,
      aiid: 1,
      name: 'cozy-mode',
      parmas: [] 
    }
  }
};

/**
 * 用于 1 个 set spec 返回解析
 * return true/false
 */
export const GSSetSpecSuccess = (res) => {
  if (typeof (res) === 'undefined') {
    return false;
  } else if (typeof (res) === 'object') {
    if (Array.isArray(res)) {
      if (res.length == 0) {
        return false;
      } else {
        let val = res[0];
        return val.code == 0;
      }
    } else {
      return res.code == 0;
    }
  } 
};

/**
 * 用于 多个 set spec 返回解析
 * return {success:true, value:{{succes , ssiid, piid}, {success , ssiid, piid}, {success , ssiid, piid}}}
 */
export const GSSetSpecResone = (res) => {
  let result = { success: false, value: undefined };
  if (typeof (res) === 'undefined') {
    return result;
  } else if (typeof (res) === 'object') {
    if (Array.isArray(res)) {
      if (res.length == 0) {
        return result;
      } else {
        let values = [];
        res.map((val) => {
          const { siid, piid, code } = val;
          values.push({ success: code == 0, siid, piid });
        });
        result.success = true;
        result.value = values;
        return result;
      }
    } else {
      result.success = res.code == 0;
      result.value = res.value;
      return result;
    }
  }
};

/**
 * 
 * 用于 个 get spec 返回解析
 * return {success, value}
 */
export const GSSetSpecResult = (res) => {
  let result = { success: false, value: undefined };
  if (typeof (res) === 'undefined') {
    return result;
  } else if (typeof (res) === 'object') {
    if (Array.isArray(res)) {
      if (res.length == 0) {
        return result;
      } else {
        let val = res[0];
        result.success = val.code == 0;
        result.value = val.value;
        return result;
      }
    } else {
      result.success = res.code == 0;
      result.value = res.value;
      return result;
    }
  } 
};


/**
 * 
 * 用于 多个 get spec 返回解析
 * return {success:true, value:{{success, siid, piid, value}, {...}, {...}}}
 */
export const GSSetSpecResults = (res) => {
  let result = { success: false, value: undefined };
  if (typeof (res) === 'undefined') {
    return result;
  } else if (typeof (res) === 'object') {
    if (Array.isArray(res)) {
      if (res.length == 0) {
        return result;
      } else {
        let values = [];
        res.map((val) => {
          const { siid, piid, code, value } = val;
          values.push({ success: code == 0, siid, piid, value });
        });
        result.success = true;
        result.value = values;
        return result;
      }
    } else {
      result.success = res.code == 0;
      result.value = res.value;
      return result;
    }
  } 
};


