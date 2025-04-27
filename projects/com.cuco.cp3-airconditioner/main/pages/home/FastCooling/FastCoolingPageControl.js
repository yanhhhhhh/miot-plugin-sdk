/*
 * @Author: huayou.fu
 * @Created date: 2022-01-24 15:53:33
 */

import Service from 'miot/Service';
import { GSSpec } from '../../../constants';
import { ACMode } from '../../../constants/airconditioner';
import { GSNoopFun } from '../../../constants/constant';
import {
  GSSetSpecResone,
  GSSetSpecResult,
  GSSetSpecResults,
  GSSetSpecSuccess
} from '../../../constants/protocol/spec';
import { GSDeivce } from '../../../models/device';
import { HomePagePannelControl } from '../HomePagePannelControl';

class IFastCoolingPageControl {
  constructor() {
    this.switchOn = false;
    this.duration = 10;
    this.onUpdate = GSNoopFun;
  }

  getMinTemp = () => {
    let coldMode = HomePagePannelControl.getModeInfo(ACMode.cold.value);
    let min = 16;
    if (!!coldMode.temps && coldMode.temps.length > 0) {
      min = coldMode.temps[0];
    }
    return min;
  };

  switchAndDuration = async() => {
    let res = await this.specGetSwitchAndDuration();
    console.log('======switchAndDuration======', res);
    if (res.success) {
      let values = res.value;
      let results = {};
      values.map((val) => {
        const { success, siid, piid, value } = val;
        if (
          !!success &&
          siid == GSSpec.siid8.status.siid &&
          piid == GSSpec.siid8.status.piid
        ) {
          results['switchOn'] = value == 1;
        } else if (
          !!success &&
          siid == GSSpec.siid8.keep_time.siid &&
          piid == GSSpec.siid8.keep_time.piid
        ) {
          results['duration'] = value;
        }
      });
      this.onUpdate(results);
    }
  };

  setSwithOn = async(enable) => {
    let res = await this.specSetSwitchOn(enable);
    if (res) {
      this.onUpdate({ switchOn: enable });
      HomePagePannelControl.updateFastCodeState(enable);
    }
  };

  setDuration = async(duration) => {
    let res = await this.specSetDuration(duration);
    if (res) {
      this.onUpdate({ duration });
    }
  };

  setSwithOnAndDuration = async(switchOn, duration) => {
    let res = await this.specSetSwithAndDuraton(switchOn, duration);
    if (!!res && !!res.success) {
      if (this.onUpdate) {
        this.onUpdate({ switchOn, duration });
      }
    }
  };

  specGetSwitchAndDuration = () => {
    console.log('=======getSwitchAndDuration======');
    let promise = new Promise((resolve, reject) => {
      const { siid: s0, piid: p0 } = GSSpec.siid8.status; // 开关
      const { siid: s1, piid: p1 } = GSSpec.siid8.keep_time; // 持续时间
      let params = [
        { did: GSDeivce.did, siid: s0, piid: p0 },
        { did: GSDeivce.did, siid: s1, piid: p1 }
      ];
      Service.spec
        .getPropertiesValue(params)
        .then((res) => {
          console.log('======== specGetSwitchAndDuration', res);
          resolve(GSSetSpecResults(res));
        })
        .catch((error) => {
          resolve({ success: false, value: undefined });
        });
    });
    return promise;
  };

  specSetSwithAndDuraton = (swittchOn, duration) => {
    console.log('=======specSetDuration======');
    let promise = new Promise((resolve, reject) => {
      const { siid: s0, piid: p0 } = GSSpec.siid8.status; // 开关
      const { siid: s1, piid: p1 } = GSSpec.siid8.keep_time; // 持续时间
      let params = [
        { did: GSDeivce.did, siid: s0, piid: p0, value: swittchOn },
        { did: GSDeivce.did, siid: s1, piid: p1, value: duration }
      ];
      Service.spec
        .setPropertiesValue(params)
        .then((res) => {
          console.log('======== specSetDuration', res);
          resolve(GSSetSpecResone(res));
        })
        .catch((error) => {
          resolve(false);
        });
    });
    return promise;
  };

  specSetSwitchOn = (value) => {
    console.log('=======specSwtSwitchOn======');
    let promise = new Promise((resolve, reject) => {
      const { siid: s0, piid: p0 } = GSSpec.siid8.status; // 开关
      let params = [{ did: GSDeivce.did, siid: s0, piid: p0, value: value }];
      Service.spec
        .setPropertiesValue(params)
        .then((res) => {
          console.log('======== specSwtSwitchOn', res);
          resolve(GSSetSpecSuccess(res));
        })
        .catch((error) => {
          resolve(false);
        });
    });
    return promise;
  };

  specSetDuration = (value) => {
    console.log('=======specSetDuration======');
    let promise = new Promise((resolve, reject) => {
      const { siid: s0, piid: p0 } = GSSpec.siid8.keep_time; // 开关
      let params = [{ did: GSDeivce.did, siid: s0, piid: p0, value: value }];
      Service.spec
        .setPropertiesValue(params)
        .then((res) => {
          console.log('======== specSetDuration', res);
          resolve(GSSetSpecSuccess(res));
        })
        .catch((error) => {
          resolve(false);
        });
    });
    return promise;
  };
}

export const FastCoolingPageControl = new IFastCoolingPageControl();
