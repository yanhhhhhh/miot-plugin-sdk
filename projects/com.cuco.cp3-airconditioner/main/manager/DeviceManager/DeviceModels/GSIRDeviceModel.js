/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-24 11:52:13 
 */

class IGSIRDeviceModel {
  constructor(props) {
    this.did = undefined; // did
    this.name = undefined; // name
    this.info = {}; // info.

    // 其中  Mm_Ty_Ss_Dd    m:表示模式, y:表示温度, s:表示风速, d:表示风向(0表示扫风)
    this.Mm = 'M0'; //
    this.Ty = 'T20'; // 16 - 30
    this.Ss = 'S0'; // 0, 1, 2, 3
    this.Dd = 'D0'; 
  }
}
export const GSIRDeviceModel = { IGSIRDeviceModel };