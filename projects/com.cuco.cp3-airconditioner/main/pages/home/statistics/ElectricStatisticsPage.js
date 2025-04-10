/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-08 15:17:13 
 * 月电量统计
 */
import { AbstractDialog } from "mhui-rn";
import React from "react";
import { Device, DeviceEvent } from "miot";
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView } from "react-native";
import GSDialogPage from "../../../components/dialog/GSDialog";
import SafeAreaBaseContainer from "../../../components/SafeArea/SafeAreaBaseContainer";
import StaticChart from "../../../components/StatisticsChart/StatisticsChart";
import { GSImage } from "../../../constants/image/image";
import { navigatePopPage } from "../../../navigate";
import { GSColors, IconStyles, MainScreen, normalContentWidth } from "../../../styles";
import { GSFont } from "../../../styles/font";
import MHDatePicker from "miot/ui/MHDatePicker";
import { DateManagerMgr } from "../../../helper/date/date";
import { GSLocalize } from "../../../manager/LanguageManager/LanguageManager";
import { LocalStorageMgr } from "../../../manager/LocalStorageManager/LocalStorageManager";
import GSDatePicker from "../../../components/DatePicker/GSDatePicker";
import { GSSystem } from "../../../configuration/system";
export default class ElectricStatisticsPage extends SafeAreaBaseContainer {
  constructor(props) {
    super(props);
    this.state = {
      chartType: 'week',
      showDiaLog: false,
      didMount: false,
      MonthPickerVisible: false, // 月控件显示
      WeekPickerVisible: false, // 周控件显示
      yAxis: [], // Y轴数据
      xAxis: [], // X 轴数据
      values: [],
      valueRange: [],
      dateInfo: [], // 日历数组 [2021,12,3]
      showSelectDate: "", // 展示选中的日期
      selectDate: "", // 选中的日期
      selectDateElectric: "", // 选中日期的用电量
      selectedWhichOne: 0, // 选中柱子下表
      ElectricQuantity: '-', // 当前电量
      CurrentPower: '-', // 当前功率
      StartTime: '', // 查询开始时间
      EndTime: '', // 查询结束时间
      showDatePicker: false, // 月份
      totalMonthPower: '-', // 月份总的电量
      totalWeekPower: '-' // 本周总的电量
    };
  }
  UNSAFE_componentWillMount() {
    // LocalStorageMgr.set(Device.deviceID + "_ElectricQuantity_" + DateManagerMgr.getFullDate(),{"ElectricQuantity":20})
    // LocalStorageMgr.set(Device.deviceID + "_CurrentPower_" + DateManagerMgr.getFullDate(),{"CurrentPower":190})
    // console.log("addListeneraddListeneraddListeneraddListeneraddListeneraddListener:", `${ Device.deviceID }_ElectricQuantity_${ DateManagerMgr.getFullDate() }`);
    // LocalStorageMgr.get(`${ Device.deviceID }_ElectricQuantity_${ DateManagerMgr.getFullDate() }`).then((res) => {
    //   let arr = Object.keys(res);
    //   if (arr.length) {
    //     this.setState({ "ElectricQuantity": res["ElectricQuantity"] });
    //   }
    // }).catch((err) => {

    // });
    LocalStorageMgr.get(`${ Device.deviceID }_CurrentPower_${ DateManagerMgr.getFullDate() }`).then((res) => {
      if (Object.keys(res).length) {
        this.setState({ "CurrentPower": res.CurrentPower });
      }
    }).catch((err) => {
     
    });
    this.addListener();
  }
  addListener() {
    /**
     * 对设备属性进行订阅
     * prop.属性名, profile 设备这样进行传参   eg: prop.power
     * prop.siid.piid， spec协议设备这样进行传参  eg: prop.2.1
     * 7.1电量  
     * 7.6 功率
     */
    Device.getDeviceWifi().subscribeMessages("prop.power", 'prop.7.1', 'prop.7.6').then((subcription) => {
      this.mSubcription = subcription;
    }).catch((error) => {
      console.log('subscribeMessages error', error);
    });

    // 监听设备属性发生变化事件； 当设备属性发生改变，会发送事件到js，此处会收到监听回调
    this.mDeviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
      (device, map, data) => {
        // console.log('Device.addListener@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', device, map, data);
        this.listenElectric(data);
      });
  }
  listenElectric(data) { // 监听电源消耗
    //     ElectricQuantity: 0, //当前电量
    // CurrentPower: 0, //当前功率
    if (data.length) {
      let current_data = data[0];
      if (current_data.key == "prop.7.1") {
        DateManagerMgr.getDayPowerNumber().then((res) => {
          let totalMonthPower = DateManagerMgr.CalculateTotalPower(res);
          this.setState({ ElectricQuantity: totalMonthPower.toString() });
        });
      }
      if (current_data.key == "prop.7.6") {
        LocalStorageMgr.set(`${ Device.deviceID }_CurrentPower_${ DateManagerMgr.getFullDate() }`, { "CurrentPower": current_data.value[0].toFixed(2) });
        this.setState({ "CurrentPower": current_data.value[0].toFixed(2) });
      }
    }
  }
  removeListener() {
    // 取消订阅
    this.mSubcription && this.mSubcription.remove();
    // 取消监听
    this.mDeviceReceivedMessages && this.mDeviceReceivedMessages.remove();
  }
  componentDidMount() {
    console.log("current>>>>>>>>>>>>!!!!!!!!!!!!!!!!!!!!!!!!!", DateManagerMgr.getCurrentDate());
    DateManagerMgr.getDayPowerNumber().then((res) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>::::dddddddddddddddddddddddddddddddddddd::", res);
      let totalMonthPower = DateManagerMgr.CalculateTotalPower(res);
      LocalStorageMgr.set(`${ Device.deviceID }_ElectricQuantity_${ DateManagerMgr.getFullDate() }`, { "ElectricQuantity": totalMonthPower.toString() });
      this.setState({ ElectricQuantity: totalMonthPower.toString() });
    });
    DateManagerMgr.getAllMonthPowerNumber().then((res) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>::::::", res);
      let totalMonthPower = DateManagerMgr.CalculateTotalPower(res);
      this.setState({ totalMonthPower: totalMonthPower.toString() });
      // console.log("month=========================month:================", JSON.stringify(res));
    });
    DateManagerMgr.getAllWeekPowerNumber().then((res) => {
      let totalWeekPower = DateManagerMgr.CalculateTotalPower(res);
      this.setState({ totalWeekPower: totalWeekPower.toString() });
      console.log("getAllWeekPowerNumber=========================getAllWeekPowerNumber:================", JSON.stringify(res));
    });
    this.initCurrentDate();
   
    setTimeout(() => {
      this.setState({
        didMount: true // 优化卡顿性能。
      });
    }, 500);
  }
  componentWillUnmount() {
    this.removeListener();
  }
  initCurrentDate() {
    let currentDate = DateManagerMgr.getCurrentDate();
    this.setState({ "dateInfo": currentDate }, () => {
      this.setDate(currentDate);
    });
  }

  getDates(start, end) {
    // let source = [{"key":"2021_12_01","val":"xxx1"},{"key":"2021_12_02","val":"xxx2"}]
    // DateManagerMgr.getEveryDayElectric({},source);
    // let jsonObj = DateManagerMgr.getRangeCount(31,2022,1)
    let info;
    if (this.state.chartType == "week") {
      DateManagerMgr.getPowerDayStatisDate(start, end).then((PowerDayStatisDate) => {
        console.log("start::::", start, "end::::", end);
        console.log("result:::::::::::::::::PowerDayStatisDatePowerDayStatisDatePowerDayStatisDatePowerDayStatisDatePowerDayStatisDate:::::::", PowerDayStatisDate);
        info = DateManagerMgr.outWeekDate(this.state.dateInfo.join("-"), PowerDayStatisDate);
        this.setState({ "yAxis": info.yAxis, "xAxis": info.xAxis, "values": info.values, "valueRange": info.valueRange }, () => {
          this.initCurentDayElectricInfo();
        });
      }).catch((err) => {
        // console.log("info:------------< errerr: ", err);
      });
      
    } else {
      DateManagerMgr.getPowerDayStatisDate(start, end).then((PowerDayStatisDate) => {
        info = DateManagerMgr.outMonthInfo(this.state.dateInfo[0], this.state.dateInfo[1], PowerDayStatisDate);
        this.setState({ "yAxis": info.yAxis, "xAxis": info.xAxis, "values": info.values, "valueRange": info.valueRange }, () => {
          this.initCurentDayElectricInfo();
        });
      }).catch((err) => {});
    }
  }
  initCurentDayElectricInfo() {
    let currentDate = this.state.dateInfo;
    console.log(currentDate);
    let monthAndDay = `${ currentDate[1] }_${ currentDate[2] }`;
    console.log(monthAndDay);
    let values = this.state.values;
    let index = 0;
    let currentObj = values.find(function(currentObj, idx) {
      if (currentObj.txt === monthAndDay) {
        if (__DEV__ && console.warn) {
          console.warn("currentObj.txt:", currentObj.txt, "monthAndDay=:", monthAndDay, idx);
        }
        index = idx;
      }
      return currentObj.txt === monthAndDay;
    });
    if (currentObj) {
      let dateInfo = currentObj.txt.split("_");
      // let selectDate = `${ dateInfo[0] }月${ dateInfo[1] }日`;
      let selectDate = `${ dateInfo[0] }.${ dateInfo[1] }`;
      this.setState(
        { "selectDate": selectDate, "selectDateElectric": currentObj.val, selectedWhichOne: index }
      );
    }
  }
  changeType(type) {
    this.setState({
      chartType: type,
      selectedWhichOne: 0,
      yAxis: [],
      xAxis: [],
      values: [],
      valueRange: []
    }, () => {
      this.initCurrentDate();
      
    });
  }
  // 日期空间操作
  SwitchPicker() {
    if (this.state.chartType == "week") {
      this.setState({ "WeekPickerVisible": true, "showDatePicker": false });
    } else {
      this.setState({ "WeekPickerVisible": false, "showDatePicker": true });
    }
  }
  disMonth() {
    this.setState({ "showDatePicker": false });
  }
  disWeek() {
    this.setState({ "WeekPickerVisible": false });
  }
  getMonth(res) {
    let dataInfo = [res["yearValue"], res["monthValue"]];
    this.setState({ "dateInfo": dataInfo, "showDatePicker": false }, () => {
      this.setDate(dataInfo);
    });
  }
  getWeek(res) {
    let dataInfo = res.rawArray;
    dataInfo = dataInfo.map((item) => {
      return Number(item);
    });
    this.setState({ "dateInfo": dataInfo }, () => {
      this.setDate(dataInfo);
    });
  }
  setDate(dateInfo) {
    if (this.state.chartType == "week") {
      let selectDayInfo = DateManagerMgr.getStartAndEndDate(`${ dateInfo[0] }-${ dateInfo[1] }-${ dateInfo[2] }`);
      let start = Date.parse(selectDayInfo[0].replace('.', '-').replace('.', '-'));
      let end = Date.parse(selectDayInfo[1].replace('.', '-').replace('.', '-'));
      this.setState({
        "StartTime": start, "EndTime": end,
        "showSelectDate": `${ selectDayInfo[0] } To ${ selectDayInfo[1] }`
      });
      this.getDates(start, end);
    } else {
      let getDateNum = DateManagerMgr.getMonthDay(dateInfo[0], dateInfo[1], 0); // 月份的天数
      let selectDate = `${ dateInfo[0] }.${ dateInfo[1] }`;
      let start = Date.parse(`${ dateInfo[0] }-${ dateInfo[1] }-01`);
      let end = Date.parse(`${ dateInfo[0] }-${ dateInfo[1] }-${ getDateNum }`);
      this.setState({ 
        "StartTime": start, "EndTime": end,
        "showSelectDate": selectDate 
      });
      this.getDates(start, end);
    }

  }

  setElectData(index) {
    let values = this.state.values;
    let currentObj = values.find(function(currentObj, idx) {
      if (idx == index) {
        return currentObj;
      }
    });
    this.setCurrentDayElectric(currentObj);
  }
  // {"show": 1, "txt": "01_17", "val": 0}
  setCurrentDayElectric(currentObj) {
    if (currentObj) {
      let dateInfo = currentObj.txt.split("_");
      // let selectDate = `${ dateInfo[0] }月${ dateInfo[1] }日`;
      let selectDate = `${ dateInfo[0] }.${ dateInfo[1] }`;
      this.setState(
        { "selectDate": selectDate, "selectDateElectric": currentObj.val }
      );
    }
    console.log("current:", currentObj);
    console.log('====== on select index: ', index);
    console.log(this.state.values);
  }
    DialogView = () => {
      let values = [];
      for (let index = 0; index < 100; index++) {
        values.push({ title: GSLocalize("acid48"), time: '00:55' });
      }
      return <View style={{ width: '100%', alignItems: 'center' }}>
        {
          values.map((val, index) => {
            return <View key={index} style = {{ height: 52, width: MainScreen.width - 54, flexDirection: 'row' }}> 
              <Text style = {{ textAlign: 'left', width: '50%', fontWeight: GSFont.Regular, fontSize: 16, color: 'black' }}>{val.title}</Text>
              <Text style = {{ textAlign: 'right', width: '50%', fontWeight: GSFont.Regular, fontSize: 13, color: '#999999' }}>{val.time}</Text>
            </View>;
          })
        }
      </View>;
    }

    showDiaLogView = () => {
      this.setState({
        showDiaLog: true
      });
    }

    getValues(type) {
      if (type == 'week') { // 一定只能是 7个
        return [{ val: '0.2', txt: '周五' }, { val: '1.0', txt: '周六' }, { val: '2', txt: '周日' }, { val: '0', txt: '周一' }, { val: '0.5', txt: '周二' }, { val: '0', txt: '周三' }, { val: '0', txt: '周四' }];
      } else { // 当月的个数

        return [{ val: '0', txt: '周五' }, { val: '1.0', txt: '周六' }, { val: '2', txt: '周日' }, { val: '0', txt: '周一' }, { val: '0.5', txt: '周二' }, { val: '0', txt: '周三' }, { val: '0', txt: '周四' }, { val: '0', txt: '周五' }, { val: '1.0', txt: '周六' }, { val: '2', txt: '周日' }, { val: '0', txt: '周一' }, { val: '0.5', txt: '周二' }, { val: '0', txt: '周三' }, { val: '0', txt: '周四' }, { val: '0', txt: '周五' }, { val: '1.0', txt: '周六' }, { val: '2', txt: '周日' }, { val: '0', txt: '周一' }, { val: '0.5', txt: '周二' }, { val: '0', txt: '周三' }, { val: '0', txt: '周四' }];
      }
    }
    render() {
      const { showDiaLog, showDatePicker } = this.state;
      this.setToastView(showDatePicker ? 
        <GSDatePicker onDismiss = {() => {
          this.setState({
            showDatePicker: false
          });
        }} onCancel = {() => {
          this.setState({
            showDatePicker: false
          });
        }} onConfirm = {
          (res) => this.getMonth(res)
        }/> : undefined);
      // 设置导航栏
      this.setDefaultNavibar({
        title: GSLocalize("acid96"),
        onback: () => { navigatePopPage(this); }
      });
      this.baseRemoveTopNaviMargin();
      // 设置渐变背景
      this.setBlackModeBlackGradient();

      // 设置日志弹窗
      // this.setToastView(showDiaLog ?
      //   <GSDialogPage 
      //     title = {GSLocalize('acid47')}
      //     customView = {
      //       this.DialogView()
      //     } onHide = {
      //       () => {
      //         this.setState({
      //           showDiaLog: false
      //         });
      //       }
      //     }/> : undefined);

      return super.render();
    }

    gsRender() {
      const { chartType, didMount } = this.state;
      // 设置背景view
      let selectedTextColor = '#xmffffff';
      let textColor = '#xm999999';
      if (GSSystem.isDarkMode()) { // 黑暗模式
        selectedTextColor = '#xm000000';
        textColor = '#xm666666';
      }
      return <View style={styles.container}>
        {/* 今日电量，当月电量，当前功率 */}
        <View style={styles.consumptionContainer}>
          <View style={styles.consumptionCellContainer}>
            <View style={styles.consumptionCell}>
              <Text style={styles.consumptionCellValue}>{this.state.ElectricQuantity}</Text>
              <Text style={styles.consumptionCellDes}>{GSLocalize("acid42")}</Text>
            </View>
            <View style={[styles.consumptionCell, { width: 1, height: 44, backgroundColor: '#E5E5E5' }]} />
            <View style={styles.consumptionCell}>
              <Text style={styles.consumptionCellValue}>{this.state.CurrentPower}</Text>
              <Text style={styles.consumptionCellDes}>{GSLocalize("acid43")}</Text>
            </View>
          </View>
          <View style={styles.consumptionCellContainer}>
            <View style={styles.consumptionBottomCell}>
              <Text style={styles.consumptionCellValue}>{this.state.totalWeekPower}</Text>
              <Text style={styles.consumptionCellDes}>{GSLocalize("acid44")}</Text>
            </View>
            <View style={[styles.consumptionBottomCell, { width: 1, height: 44, backgroundColor: '#E5E5E5' }]} />
            <View style={styles.consumptionBottomCell}>
              <Text style={styles.consumptionCellValue}>{this.state.totalMonthPower}</Text>
              <Text style={styles.consumptionCellDes}>{GSLocalize("acid45")}</Text>
            </View>
            {/* <View style={[styles.consumptionBottomCell, { width: 1, height: 44, backgroundColor: '#E5E5E5' }]} />
            <View style={styles.consumptionBottomCell}>
              <Text style={styles.consumptionCellValue}>{'999+'}</Text>
              <Text style={styles.consumptionCellDes}>{GSLocalize("acid46")}</Text>
              <View style={{ position: "absolute", width: '100%', height: '100%', flexDirection: 'row-reverse' }}>
                <TouchableOpacity onPress={
                  () => {
                    this.showDiaLogView();
                  }
                } style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                  <Image style={{ ...IconStyles.size16 }} source={GSImage.infoGreen} />
                </TouchableOpacity>
              </View>
            </View> */}
          </View>
        </View>
        {/* 统计表格 */}
        <View style={styles.chartsContainer}>
          <View style={{ marginTop: 20, width: 204, height: 32, borderRadius: 6, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => {
              this.changeType("week");
            }} style={{ height: 26, width: 99, borderRadius: 6, backgroundColor: chartType == 'week' ? '#00D3BE' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: chartType == 'week' ? selectedTextColor : textColor, lineHeight: 20, fontWeight: GSFont.Semibold, fontSize: 14 }}>{GSLocalize("acid58")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.changeType("month");
            }} style={{ marginLeft: 2, height: 26, width: 99, borderRadius: 6, backgroundColor: chartType == 'month' ? '#00D3BE' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: chartType == 'month' ? selectedTextColor : textColor, lineHeight: 20, fontWeight: GSFont.Semibold, fontSize: 14 }}>{GSLocalize("acid59")}</Text>
            </TouchableOpacity>
          </View>
          {/* 2021年9月20日至26日 */}
          <View style={{ marginTop: 27, height: 20, justifyContent: 'center', width: normalContentWidth - 40 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { this.SwitchPicker(); }}>
              <Text style={{ fontWeight: GSFont.Regular, fontSize: 14, color: '#333333', lineHeight: 20 }}>{this.state.showSelectDate}</Text>
              <Image source={GSImage.arrowRight} style={{ ...IconStyles.size16 }} />
            </TouchableOpacity>
          </View>
          {/* 2021年9月20日至26日 */}
          <View style={{ marginTop: 27, height: 40, width: normalContentWidth - 40, flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%', justifyContent: 'flex-start' }}>
              <Image source={GSImage.lightning} style={{ ...IconStyles.size16, width: 10 }} />
              <Text style={{ marginLeft: 3, fontWeight: GSFont.Semibold, fontSize: 16, color: '#333333', lineHeight: 22 }}>{ this.state.selectDate }</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '50%' }}>
              <Text style={{ marginRight: 4, fontWeight: GSFont.Semibold, fontSize: 29, color: GSColors.mainColor, lineHeight: 40 }}>{ this.state.selectDateElectric }</Text>
              <Text style={{ fontWeight: GSFont.Regular, fontSize: 14, color: '#333333', lineHeight: 20 }}>{GSLocalize("acid62")}</Text>
            </View>
          </View>
          {/*
                    type={chartType}
                    values: [{val:'0', txt:'周五'},  {val:'1.0', txt:'周六'}, {val:'2', txt:'周日'}, {val:'0', txt:'周一'}, {val:'0.5', txt:'周二'}, {val:'0', txt:'周三'}, {val:'0', txt:'周四'}], 
                    xAxis: ['周五', '周六','周日','周一','周二','周三','周四'], //['周五', '周六','周日','周一','周二','周三','周四'],
                    yAxis:['0.0', '1', '1.5', '2.0', '2.5'],
                    valueRange: [0.0, 2.5], */}
          <View>
            {
              didMount && <StaticChart
                type={chartType}
                // values={this.getDates(chartType)}
                values={this.state.values}
                xAxis={this.state.xAxis} // ['周五', '周六','周日','周一','周二','周三','周四'],
                yAxis={this.state.yAxis}
                valueRange={this.state.valueRange} // [0.0, 2.5]
                containerStyle={{ width: normalContentWidth - 40, backgroundColor: 'white', marginTop: 40 }}
                selectedWhichOne={this.state.selectedWhichOne}
                onSelectWhichOne = {
                  (index) => {
                    let values = this.state.values;
                    let currentObj = values.find(function(currentObj, idx) {
                      if (idx == index) {
                        return currentObj;
                      }
                    });
                    if (currentObj) {
                      let dateInfo = currentObj.txt.split("_");
                      // let selectDate = `${ dateInfo[0] }月${ dateInfo[1] }日`;
                      let selectDate = `${ dateInfo[0] }.${ dateInfo[1] }`;
                      this.setState(
                        { "selectDate": selectDate, "selectDateElectric": currentObj.val }
                      );
                    }
                  }
                }/>
            }
          </View>
          <MHDatePicker
            visible={this.state.WeekPickerVisible}
            title={GSLocalize("acid38")}
            type={MHDatePicker.TYPE.DATE}
            onDismiss={() => this.disWeek()}
            onSelect={(res) => this.getWeek(res)}
          />
        </View>
      </View>;
    }

}
const styles = StyleSheet.create({
  container: {
    width: MainScreen.width,
    height: '100%',
    alignItems: 'center'
  },

  consumptionContainer: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 192,
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },

  consumptionCellContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 96
  },

  consumptionCell: {
    width: '50%',
    height: 96,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  consumptionCellValue: {
    fontSize: 24,
    lineHeight: 32,
    color: '#333333',
    fontWeight: GSFont.Semibold
  },

  consumptionCellDes: {
    marginTop: 8,
    lineHeight: 16,
    fontSize: 11,
    color: '#999999',
    fontWeight: GSFont.Regular
  },

  consumptionBottomCell: {
    width: '50%',
    height: 96,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 统计表格
  chartsContainer: {
    marginTop: 12,
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 396,
    borderRadius: 12,
    backgroundColor: '#ffffff'
  }

});