/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-13 10:45:59 
 */
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";
import Service from "miot/Service";
import { Device } from "miot";
import { stringify } from "uuid";
export const DateConst = {
  MonthEveryRangeCount: 4, // 设置 月份 每个区间的 元素 个数
  ElectricUseRangeCount: 5 // 用电度数使用 返回
};
class DateManager {

  // 获取某一个日期是星期几
  indexOfWeek(date = new Date()) {
    return date.getDay();
  }

  // 计算两天相差的天数
  daysOff(date0:Date, date1:Date) {
    let dates0 = this.getCurrentDateNew(date0);
    let dates1 = this.getCurrentDateNew(date1);
    let ts0 = new Date(parseInt(dates0[0]), parseInt(dates0[1]), parseInt(dates0[2])).getTime();
    let ts1 = new Date(parseInt(dates1[0]), parseInt(dates1[1]), parseInt(dates1[2])).getTime();
    return parseInt((ts0 - ts1) / (1000 * 3600 * 24)); // 相差的天数
  }

  // 获取当前接下来一50天内的工作日
  getWorkDaysOfNext50days(date = new Date(), cnWorkDays:Array, cnFreeDays:Array): Array {
    try {
      let oneDay = 24 * 3600 * 1000;// 一天的毫秒数
      let ts = date.getTime();
      let results = [];
      for (let index = 0; index < 50; index++) {
        let idate = new Date(ts + oneDay * index);
        let weekIndex = this.indexOfWeek(idate);
        let idates = this.getCurrentDateNew(idate);
        let day = `${ idates[0] }${ idates[1] }${ idates[2] }`;
        if (!!cnWorkDays && cnWorkDays.length > 0 && cnWorkDays.indexOf(day) !== -1) {
          results.push(day);
        } else if (weekIndex != 0 && weekIndex != 6 && (!cnFreeDays || cnFreeDays.length == 0 || cnFreeDays.indexOf(day) === -1)) {
          results.push(day);
        }
      }
      return results;
    } catch (error) { return []; }
  }

  // 获取当前接下来一50天内的周末
  getFreeDaysOfNext50days(date = new Date(), cnWorkDays:Array, cnFreeDays:Array):Array {
    let oneDay = 24 * 3600 * 1000;// 一天的毫秒数
    let ts = date.getTime();
    let results = [];
    for (let index = 0; index < 50; index++) {
      let idate = new Date(ts + oneDay * index);
      let weekIndex = this.indexOfWeek(idate);
      let idates = this.getCurrentDateNew(idate);
      let day = `${ idates[0] }${ idates[1] }${ idates[2] }`;
      if (!!cnFreeDays && cnFreeDays.length > 0 && cnFreeDays.indexOf(day) !== -1) {
        results.push(day);
      } else if ((weekIndex == 0 || weekIndex == 6) && (!cnWorkDays || !cnWorkDays.length == 0 || cnWorkDays.indexOf(day) === -1)) {
        let idates = this.getCurrentDateNew(idate);
        let day = `${ idates[0] }${ idates[1] }${ idates[2] }`;
        results.push(day);
      }
    }
    console.log('========= getFreeDaysOfNext50days: ', results);
    return results;
  }


  // 根据年月 获取到 天数
  // day == 0 ,最后一天
  getMonthDay(year, month, day) {
    let dateObj = new Date(year, month, day);
    return dateObj.getDate();
  }
  // 获取当前的年月日
  getCurrentDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth(); // 0 - 11
    month = month + 1;
    if (month < 10) {
      month = `0${ month }`;
    }
    let day = date.getDate();
    if (day < 10) {
      day = `0${ day }`;
    }
    console.log(`${ year }--`, `${ month }---`, day);
    return [year, month, day];
  }

  // 获取当前的年月日 时分秒
  getCurrentDateNew(date = new Date()) {
    let year = date.getFullYear();
    let month = date.getMonth(); // 0 - 11
    month = month + 1;
    if (month < 10) {
      month = `0${ month }`;
    }
    let day = date.getDate();
    if (day < 10) {
      day = `0${ day }`;
    }

    let hour = date.getHours();
    if (hour < 10) {
      hour = `0${ hour }`;
    }

    let minute = date.getMinutes();
    if (minute < 10) {
      minute = `0${ minute }`;
    }

    let second = date.getSeconds();
    if (second < 10) {
      second = `0${ second }`;
    }
    return [`${ year }`, `${ month }`, `${ day }`, `${ hour }`, `${ minute }`, `${ second }`];
  }


  /**
     * @description 获取区间数
     * @param monthDayCount // 每个月的天数
     * @returns {number} // 区间的个数
     */
  getRangeCount(monthDayCount, year, month) {

    let theFour = 22;
    if (monthDayCount == 31) {
      theFour = 23;
    }
    let showValues = [1, 8, 15, theFour, monthDayCount];
    // let isZero = monthDayCount % DateConst.MonthEveryRangeCount;
    // let group = monthDayCount / DateConst.MonthEveryRangeCount;
    // let beforeLastNum = 0;
    // let lastNum = 0;
    // let everyCount = group;
    // if(isZero) {
    //     everyCount = Math.ceil(group);
    //     beforeLastNum = (DateConst.MonthEveryRangeCount - 1) * everyCount;  //

    //     lastNum = monthDayCount - beforeLastNum;  // 最后一组数量
    //     // console.log("last:",lastNum)
    // }else{
    //     beforeLastNum = monthDayCount;
    // }
    let jsonObj = {};
    // month = month < 10 ? `0${ month }` : month;
    for (let i = 1; i <= monthDayCount; i++) {
      let showMonth = 0;
      // if(i % everyCount == 1 || i == monthDayCount) {
      //     showMonth = 1;
      // }
      showValues.map((val) => {
        if (val == i) {
          showMonth = 1;
        }
      });
      let setDay = i < 10 ? `0${ i }` : i;
      let yearMonthDay = `${ year }_${ month }_${ setDay }`;
      jsonObj[yearMonthDay] = { "val": '0', "txt": `${ month }_${ setDay }`, "show": showMonth };
    }
    return jsonObj;
  }

  /**
     *
     * @description 对 固件 返回的用电量 与当月的 每天用电量比对
     * jsonObj x轴
     * @param electricSources 固件返回用电量 处理   [{"key":"2021_12_01","val":"xxx1"},{"key":"2021_12_02","val":"xxx2"}]
     *
     */
  getEveryDayElectric(jsonObj, electricSources) {

    if (electricSources.length) {
      for (let i = 0; i < electricSources.length; i++) {
        if (jsonObj[electricSources[i]["key"]]) {
          jsonObj[electricSources[i]["key"]]["val"] = electricSources[i].val;
        }
      }
    }
    return jsonObj;
  }

  /**
     * 获取Y轴的最大值
     * @param jsonObj
     * @returns {number}
     */
  getY(jsonObj) {
    let ElectData = []; // 用电量 加入数组
    for (let key in jsonObj) {
      if (!ElectData.includes(Number(jsonObj[key].val))) {
        console.log("a:", jsonObj[key].val);
        ElectData.push(Number(jsonObj[key].val));
      }
    }
   
    let result = [0];
    // ElectData = [10,12,34];
    console.log("????????????get ele:", ElectData);
    if (ElectData.length) {
      let maxs = Math.max(...ElectData);
      console.log("max:", maxs);
      result = this.getYValueRange(maxs);
      return {
        "rangeValue": [0, maxs],
        "Y": result
      };
    } else {
      return {
        "rangeValue": [0, 0],
        "Y": result
      };
    }
  }
  // 获取Y 值 区间
  getYValueRange(maxY) {
    if (maxY == 0) {
      return [0];
    }
    let YeveryStep = Math.ceil(maxY / DateConst.ElectricUseRangeCount); // y 轴 区间长度
    // console.log("yyyy:",YeveryStep);
    let YrangeList = [];
    for (let i = 0; i <= DateConst.ElectricUseRangeCount; i++) {
      YrangeList.push(YeveryStep * i);
    }
    console.log(YrangeList);
    return YrangeList;

  }

  /**
     * @description  月份 隐藏x 轴不需要的点 -- 生成x轴显示
     * @param jsonObj
     * @param xAxis
     * @returns {*}
     */
  emptyXdata(jsonObj, xAxis) {
    console.log('========== MMMMM: ', JSON.stringify({ jsonObj, xAxis }));
    let newXAxis = [];
    for (let i = 0; i < xAxis.length; i++) {

      // if(jsonObj[xAxis[i]]["show"] == 0) {
      //     xAxis[i] = "";
      // }else{
      //     let tmp = xAxis[i].split("_");
      //     xAxis[i] = tmp[1] + "." + tmp[2];
      // }
      if (jsonObj[xAxis[i]]["show"] == 1) {
        let tmp = xAxis[i].split("_");
        newXAxis.push(`${ tmp[1] }.${ tmp[2] }`);
      }
    }
    return newXAxis;
  }

  /**
     * @description 输出月的统计
     * @param year
     * @param month
     * @param electricSources
     * @returns {{yAxis, xAxis: any, valueRange, values: unknown[]}}
     */
  outMonthInfo(year, month, electricSources) {
    let monthDayCount = this.getMonthDay(year, month, 0);
    let jsonObj = this.getRangeCount(monthDayCount, year, month);
    jsonObj = this.getEveryDayElectric(jsonObj, electricSources);
    let yInfo = this.getY(jsonObj);
    let valueRange = yInfo["rangeValue"];
    let yAxis = yInfo["Y"];
    let xAxis = Object.keys(jsonObj);
    let values = Object.values(jsonObj);
    if (!yAxis || yAxis.length == 0 || yAxis.length == 1) {
      yAxis = ['0', '2', '4', '6', '8', '10'];
    }
    xAxis = this.emptyXdata(jsonObj, xAxis);
    return {
      "xAxis": xAxis,
      "yAxis": yAxis,
      "values": values,
      "valueRange": valueRange
    };
  }

  //* ********************************************/
  // 2022-01-17
  getEveryDayList(dateString) {
    let dataList = [];
    let dateInfo = dateString.split("-");
    let date = new Date(dateInfo[0], parseInt(dateInfo[1]) - 1, dateInfo[2]);
    let currentYear = date.getFullYear();
    let currentMonth = date.getMonth();
    let currentWeekDay = date.getDate();
    let currentDate = date.getDay(); // 周几
    let jsonObj = {};
    let weekStartDay = new Date( // 周一
      currentYear,
      currentMonth,
      currentWeekDay - currentDate + (currentDate ? 1 : -6)
    );
    let j = 0;
    for (let i = 0; i < 7; i++) {
      weekStartDay = weekStartDay.setDate(weekStartDay.getDate() + j);
      weekStartDay = new Date(weekStartDay);
      j = 1;
      let month = weekStartDay.getMonth();
      month = month < 10 ? `0${ month + 1 }` : month + 1;
      let setDay = weekStartDay.getDate();
      setDay = setDay < 10 ? `0${ setDay }` : setDay;
      let yearMonthDay = `${ weekStartDay.getFullYear() }_${ month }_${ setDay }`;
      let showMonth = 1;
      if (jsonObj[yearMonthDay] == undefined) {
        jsonObj[yearMonthDay] = { "val": 0, "txt": `${ month }_${ setDay }`, "show": showMonth };
      }
      // console.log("abc:", weekStartDay.getMonth(), weekStartDay.getDate(), weekStartDay.getFullYear());
    }
    return jsonObj;
  }
  // 月份 年月日 数据
  getMonthDayAllDate(year, month, dayCount) {
    let jsonObj = {};
    // month = month < 10 ? `0${ month}` : month;
    for (let i = 1; i <= dayCount; i++) {
      let yearMonthDay = `${ year }_${ month }_${ i }`;
      jsonObj[yearMonthDay] = { "val": 0, "txt": `${ year }_${ month }`, "show": 1 };
    }
    return jsonObj;
  }

  /**
     * @description  输出周的统计数据
     * @param dateString
     * @param electricSources
     * @returns {{yAxis, xAxis: string[], valueRange, values: unknown[]}}
     */
  outWeekDate(dateString, electricSources) {
    let jsonObj = this.getEveryDayList(dateString);
    jsonObj = this.getEveryDayElectric(jsonObj, electricSources);
    let yInfo = this.getY(jsonObj);
    let valueRange = yInfo["rangeValue"];
    let yAxis = yInfo["Y"];
    let xAxis = this.dateToWeek();
    let values = Object.values(jsonObj);
    if (!yAxis || yAxis.length == 0 || yAxis.length == 1) {
      yAxis = ['0', '2', '4', '6', '8', '10'];
    }
    return {
      "xAxis": xAxis,
      "yAxis": yAxis,
      "values": values,
      "valueRange": valueRange
    };
  }
  dateToWeek() {
    let weekList = [GSLocalize("acid83"), GSLocalize("acid84"), GSLocalize("acid85"), GSLocalize("acid86"), GSLocalize("acid87"), GSLocalize("acid88"), GSLocalize("acid89")];
    return weekList;
  }

  /**
     * description  显示区间日期
     * @param dateString
     * @param flag
     * @returns {string}
     */
  getStartAndEndDate(dateString) {
    let jsonObj = this.getEveryDayList(dateString);
    let keys = Object.keys(jsonObj);
    let start = keys[0];
    let startArr = this.splitArr(start);
    let end = keys[keys.length - 1];
    let endArr = this.splitArr(end);
    return [`${ startArr[0] }.${ startArr[1] }.${ startArr[2] }`, `${ endArr[0] }.${ endArr[1] }.${ endArr[2] }`];
    // return `${ startArr[0] }.${ startArr[1] }.${ startArr[2] } To ${ endArr[2] }`;
    // return startArr[0] + GSLocalize("acid60") + startArr[1] + GSLocalize("acid59") + startArr[2] + GSLocalize("acid61") + endArr[2] + GSLocalize("acid61") ;
    // return `${ startArr[0] }年${ startArr[1] }月${ startArr[2] }日至${ endArr[2] }日`;

  }
  splitArr(timeString) {
    let timeArr = timeString.split("_");
    return timeArr;
  }
  // 当前年月日拼接
  getFullDate() {
    let date = new Date();
    let year = date.getFullYear();
    let mounth = date.getMonth();
    let curDate = date.getDate();
    return String(year) + String(mounth) + String(curDate);
  }
  // 用电量区间统计
  // startTime 开始时间：秒
  // endTime 结束时间： 秒
  // 
  async getPowerDayStatisDate(startTime = 0, endTime = 0) {
    let params = {
      "did": Device.deviceID,
      "data_type": "stat_day_v3",
      "key": '7.1',
      "time_start": Number(startTime) / 1000, // 日统计，默认前30天，月统计默认半年
      "time_end": Number(endTime) / 1000,
      "limit": 500
    };
    if (__DEV__ && console.warn) {
      console.warn("请求参数", JSON.stringify(params));
    }
    let electricVal = [];
    await Service.smarthome.getUserStatistics(params).then((res) => {
      if (__DEV__ && console.warn) {
        console.warn("功率统计", JSON.stringify(res), Date.now());
      }
      if (res.code == 0) {
        let statistic_Eles = res.result;
        for (let index = 0; index < statistic_Eles.length; index++) {
          let dict = statistic_Eles[index];
          let strData = this.timeToYearMonthDay(dict.time * 1000);
          let value = JSON.parse(dict.value);
          let delValue = (value[0]).toFixed(2);
          electricVal.push({ "key": strData, "val": delValue });
        }
      }
      console.log("ddd:", electricVal);
      
    }).catch((err) => {
      if (__DEV__ && console.warn) {
        console.warn("功率统计===================catch=", JSON.stringify(err), Date.now());
      }
    });
    return electricVal;
  }
  // 计算总的电量 本月
  getAllMonthPowerNumber() {
    let yearAndMonthAndDay = this.getCurrentDate();
    let year = yearAndMonthAndDay[0];
    let month = yearAndMonthAndDay[1];
    let getDateNum = DateManagerMgr.getMonthDay(year, month, 0); // 月份的天数
    let monthStart = Date.parse(`${ year }-${ month }-1`);
    let monthEnd = Date.parse(`${ year }-${ month }-${ getDateNum }`);
    console.log(monthStart, monthEnd);
    return this.getPowerDayStatisDate(monthStart, monthEnd);

  }
  // 计算本周总的用电量  本周
  getAllWeekPowerNumber() {
    let yearAndMonthAndDay = this.getCurrentDate();
    let year = yearAndMonthAndDay[0];
    let month = yearAndMonthAndDay[1];
    let day = yearAndMonthAndDay[2];
    // if (__DEV__ && console.warn) {
    //   console.warn("b@@@@@@@@@@@@@:", `${ year }-${ month }-${ day }`);
    // }
    let selectDayInfo = this.getStartAndEndDate(`${ year }-${ month }-${ day }`);
    return this.getPowerDayStatisDate(Date.parse(selectDayInfo[0]), Date.parse(selectDayInfo[1]));
  }
  // 计算总的电量 日
  getDayPowerNumber() {
    let yearAndMonthAndDay = this.getCurrentDate();
    console.log("current:::::day:", yearAndMonthAndDay);
    let day = yearAndMonthAndDay.join("-");

    let dayStart = Date.parse(`${ day } 00:00:00`);
    let dayend = Date.parse(`${ day } 23:59:59`);
    return this.getPowerDayStatisDate(dayStart, dayend);

  }
  CalculateTotalPower(res) {
    let totalPower = 0;
    if (res.length) {
      for (let i = 0; i < res.length; i++) {
        totalPower += Number(res[i]["val"]);
      }
    }
    return totalPower;
  }
  timeToYearMonthDay(timestring) {
    let dataObj = new Date(timestring);
    let year = dataObj.getFullYear();
    let month = dataObj.getMonth();
    month = month + 1;
    if (month < 10) {
      month = `0${ month }`;
    }
    let day = dataObj.getDate();
    return `${ year }_${ month }_${ day }`;
  }
}
export const DateManagerMgr = new DateManager();
