import React from 'react';
import Service from "miot/Service";
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Device, DeviceEvent } from "miot";
import { GSSpec } from "../../constants/protocol/spec";
import NavigationBar from "miot/ui/NavigationBar";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { appExit, navigatePopPage, navigatePushPage } from "../../navigate";
import { ListItem, ListItemWithSwitch } from "miot/ui/ListItem";
import MHDatePicker from "miot/ui/MHDatePicker";
import { LoadingDialog } from "miot/ui/Dialog";
import { GSFont } from "../../styles/font";
import { GSDeivce } from "../../models/device";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";
import { reject } from 'lodash';
import GSDatePicker from "../../components/DatePicker/GSDatePicker";
export default class IndicatorLightPage extends SafeAreaBaseContainer {
  componentDidMount() {
    // this.getPowerDayStatisDate()
    console.log("componentDidMountcomponentDidMountcomponentDidMount");
    this.makeTimeToStr();
  }
  componentWillUnmount() {
    console.log("unmount....start");
    // this.setIndicatorLightInfo()
    console.log("unmount....end");
  }
  UNSAFE_componentWillMount() {
    // console.log("addListeneraddListeneraddListeneraddListeneraddListeneraddListener")
    // this.addListener();
  }
  addListener() {
    /**
     * 对设备属性进行订阅
     * prop.属性名, profile 设备这样进行传参   eg: prop.power
     * prop.siid.piid， spec协议设备这样进行传参  eg: prop.2.1
     */
    Device.getDeviceWifi().subscribeMessages("prop.indicator", 'prop.10.1').then((subcription) => {
      this.mSubcription = subcription;
    }).catch((error) => {
      console.log('subscribeMessages error', error);
    });

    // 监听设备属性发生变化事件； 当设备属性发生改变，会发送事件到js，此处会收到监听回调
    this.mDeviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
      (device, map, data) => {
        // console.log('Device.addListener@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', device, map, data);
      });
  }
  constructor(prop) {
    console.log("construct................................");
    super(prop);
    let params = prop.navigation.state.params;
    console.log(params);
    this.state = {
      lightSwitch: params.lightSwitch, // 指示灯开关
      doNotDisturbModel: params.doNotDisturbModel, // 勿扰模式
      currentTimePicker: "", // 当前正在使用的picker
      isSecondDay: 0, // 是否为第二天

      // startTimeValue: ["23", "00"], // 开始时间值
      // endTimeValue: ["07", "00"], // 结束时间值
      startTimeValue: this.AllMinuteToHourAndMinute(params.startTimeMinute), // 开始时间值
      endTimeValue: this.AllMinuteToHourAndMinute(params.endTimeMinute), // 结束时间值
      TimeVisible: false, // picker 是否显示
      // ExternalStartTime: params.ExternalStartTime, // 外部开始时间
      // ExternalEndTime: params.ExternalEndTime, // 外部结束时间
      ExternalStartTime: "", // 外部开始时间
      ExternalEndTime: "", // 外部结束时间
      isSameDialog: false, // 开始时间 结束时间相同做判断
      // startTimeMinute: 23 * 60, //开始时间分钟
      // endTimeMinute:  7 * 60, //结束时间
      startTimeMinute: params.startTimeMinute, // 开始时间分钟
      endTimeMinute: params.endTimeMinute // 结束时间

    };
  }
  // 分钟转成 hour 和 分钟
  AllMinuteToHourAndMinute(minute) {
    let hour = parseInt(minute / 60);
    hour = this.addZero(hour);
    let lastMinute = minute % 60;
    lastMinute = this.addZero(lastMinute);
    return [hour, lastMinute];
  }
  addZero(num) {
    if (num < 10) {
      num = num.toString();
      num = `0${ num }`;
    } else {
      num = num.toString();
    }
    return num;
  }
  // 判断时间 
  JudgeTime(startTimeValueHour, startTimeValueMin, endTimeValueHour, endTimeValueMin) {
    if (startTimeValueHour == endTimeValueHour && startTimeValueMin == endTimeValueMin) {
      return 0; // 时间相等
    } else if (startTimeValueHour < endTimeValueHour || (startTimeValueHour == endTimeValueHour && endTimeValueMin > startTimeValueMin)) {
      return 1; // 同一天
    } else {
      return 2; // 第二天
    }
  }
  // 将数组时间转换成字符串
  makeTimeToStr() {
    let startTimeValueHour = parseInt(this.state.startTimeValue[0]);
    let startTimeValueMin = parseInt(this.state.startTimeValue[1]);
    let endTimeValueHour = parseInt(this.state.endTimeValue[0]);
    let endTimeValueMin = parseInt(this.state.endTimeValue[1]);
    console.log("start_hour:", startTimeValueHour);
    console.log("end_hour:", endTimeValueHour);

    let result = this.JudgeTime(startTimeValueHour, startTimeValueMin, endTimeValueHour, endTimeValueMin);
    let startTimeMinute = this.timeToMin(startTimeValueHour, startTimeValueMin);
    let endTimeMinute = this.timeToMin(endTimeValueHour, endTimeValueMin);
    if (result == 0) {
      console.log("value equal");
    } else if (result == 1) {
      // 结束时间大于开始时间,同一天
      this.setState({ "ExternalStartTime": this.state.startTimeValue.join(":") });
      this.setState({ "ExternalEndTime": this.state.endTimeValue.join(":") });
    
      this.setState({ "startTimeMinute": startTimeMinute });
      this.setState({ "endTimeMinute": endTimeMinute });
    } else {
      this.setState({ "isSecondDay": 1 }); // 是否为第二天
      // 结束时间 跨越到第二天
      this.setState({ "ExternalStartTime": this.state.startTimeValue.join(":") });
      let ExternalEndTime = GSLocalize('acid56') + this.state.endTimeValue.join(":");
      this.setState({ "ExternalEndTime": ExternalEndTime });
      this.setState({ "startTimeMinute": startTimeMinute });
      this.setState({ "endTimeMinute": endTimeMinute });
    }


  }
  // pickname:   startTimeVisible | endTimeVisible
  showStartOrEndTimePicker(pickerName) {
    this.setState({ "currentTimePicker": pickerName });
    this.setState({ "TimeVisible": true });

  }
  DisMiss() {
    this.setState({ "TimeVisible": false }); // 隐藏 picker
    this.setState({ "currentTimePicker": "" }); // 清除当前 picker name
  }
  timeToMinute(rawArray) {
    let TimeValueHour = parseInt(rawArray[0]);
    let TimeValueMin = parseInt(rawArray[1]);
    let minutes = this.timeToMin(TimeValueHour, TimeValueMin);
    return minutes;
  }
  // rawArray 时间空间返回胡数组
  // currentTimePicker  标识是开始时间还是结束时间
  timeReport(rawArray, currentTimePicker) {
    let Minutes = this.timeToMinute(rawArray);
    console.log("mins:", Minutes);
    let params = [];
    if (currentTimePicker == "startTimeVisible") { // 开始时间
      params = [
        { did: GSDeivce.did, siid: GSSpec.siid10.start_time.siid, piid: GSSpec.siid10.start_time.piid, value: Minutes }
      ];
    } else { // 结束时间
      params = [
        { did: GSDeivce.did, siid: GSSpec.siid10.end_time.siid, piid: GSSpec.siid10.end_time.piid, value: Minutes }
      ];
    }

    this.setIndicatorLightInfo(params).then((res) => {
      console.log("xxxxx");
      console.log(res);
    }).catch((err) => {
      console.log("errrrr:");
      console.log(err);
    });
  }
  setTimeValue(res) {
    console.log("res res res:", res);
    if (this.state.currentTimePicker == "startTimeVisible") {
      if (res.rawString === this.state.endTimeValue.join(":")) {
        this.setState({ "isSameDialog": true });
        return;
      }
      this.timeReport(res.rawArray, "startTimeVisible");// 上报开始时间
      console.log("start...", this.state.currentTimePicker);
      this.setState({ "startTimeValue": res.rawArray }, () => {
        this.makeTimeToStr();
      });
    } else if (this.state.currentTimePicker == "endTimeVisible") {
      console.log("end...", this.state.currentTimePicker);
      if (res.rawString === this.state.startTimeValue.join(":")) {
        this.setState({ "isSameDialog": true });
        return;
      }
      this.timeReport(res.rawArray, "endTimeVisible");// 上报结束时间
      this.setState({ "endTimeValue": res.rawArray }, () => {
        this.makeTimeToStr();
      });
    }
  }
  /**
   * @decription 时间转成分钟
   * @param {*} hour 
   * @param {*} min 
   * @param {*} add24 
   * @returns 
   */
  timeToMin(hour, min, add24 = 0) {
    // if(add24) { // 不用处理第二天的时间？？？
    //   return (24 + parseInt(hour)) * 60 + min;
    // }
    return parseInt(hour) * 60 + min;
  }
  setIndicatorLightInfo(params) {
    console.log("params:", params);
    return Service.spec.setPropertiesValue(params);
  }
  // 设置指示灯开关
  setlightSwitch(value) {
    this.enableLoadingActivity(true);
    let params = [
      { did: GSDeivce.did, siid: GSSpec.siid10.status.siid, piid: GSSpec.siid10.status.piid, value: value }
    ];
    this.setIndicatorLightInfo(params).then((res) => {
      console.log("xxxxx");
      console.log(res);
      if (res[0].code == 0) {
        console.log("aaaaaaaaaaaaaaaaaaaa");
        this.setState({
          lightSwitch: value
        });
          
      }
      this.enableLoadingActivity(false);
    }).catch((err) => {
      console.log("errrrr:");
      console.log(err);
      this.enableLoadingActivity(false);
    });
  }
  // 设置勿扰模式
  setDisturbModel(value) {
    this.enableLoadingActivity(true);
    let params = [
      { did: GSDeivce.did, siid: GSSpec.siid10.model.siid, piid: GSSpec.siid10.model.piid, value: value }
    ];
    this.setIndicatorLightInfo(params).then((res) => {
      console.log("???");
      if (res[0].code == 0) {
        console.log("aaaaaaaaaaaaaaaaaaaa");
        this.setState({
          doNotDisturbModel: value
        });
          
      }
      this.enableLoadingActivity(false);
    }).catch((err) => {
      console.log("errrrr:");
      console.log(err);
      this.enableLoadingActivity(false);
    });
  }
  render() {
    // 设置导航栏
    this.setDefaultNavibar({
      type: 'LIGHT',
      title: GSLocalize('IndicatorLightStatus'),
      titleStyle: {
        color: '#000000',
        fontSize: 18
      },
      onback: () => navigatePopPage(this)
    });
    // this.baseSetBackgroundColor('#F7F7F7');
    this.setDefaultWhiteBlackModeBlackGradient();
    return super.render();
  }
  gsRender() {
    return (
      <View>
        <ScrollView>
          <ListItemWithSwitch
            showSeparator={false}
            title={GSLocalize("acid36")}
            value={this.state.lightSwitch}
            onValueChange={(value) => { this.setlightSwitch(value); }}
          />
          {
            this.state.lightSwitch ? (
              <View>
                <ListItemWithSwitch
                  showSeparator={false}
                  title={GSLocalize("acid37")}
                  value={this.state.doNotDisturbModel}
                  onValueChange={(value) => { this.setDisturbModel(value); }}
                />
                {
                  this.state.doNotDisturbModel ? (
                    <View>
                      <ListItem
                        showSeparator={false}
                        title={GSLocalize("acid38")}
                        subtitle={GSLocalize("acid39")}
                        value={this.state.ExternalStartTime}
                        onPress={() => this.showStartOrEndTimePicker("startTimeVisible")}
                        onValueChange={(value) => console.log(value)}
                      />
                      <ListItem
                        showSeparator={false}
                        title={GSLocalize("acid40")}
                        subtitle={GSLocalize("acid41")}
                        value={this.state.ExternalEndTime}
                        onPress={() => this.showStartOrEndTimePicker("endTimeVisible")}
                        onValueChange={(value) => console.log(value)}
                      />
                    </View>
                  ) : null
                }
              </View>
            ) : null
          }

          <MHDatePicker
            visible={ this.state.TimeVisible }
            title={ this.state.currentTimePicker == "startTimeVisible" ? GSLocalize("acid38") : GSLocalize("acid40") }
            type={MHDatePicker.TYPE.TIME24}
            current={this.state.currentTimePicker == "startTimeVisible" ? this.state.startTimeValue : this.state.endTimeValue}
            onDismiss={() => this.DisMiss()}
            onSelect={(res) => this.setTimeValue(res)}
            datePickerStyle = {
              {
                titleStyle: {
                  color: '#333333',
                  fontSize: 16,
                  lineHeight: 22,

                  fontWeight: GSFont.Semibold
                },
                leftButtonStyle: {
                  color: '#333333',
                  fontWeight: GSFont.Semibold,
                  fontSize: 14
                },
                rightButtonStyle: {
                  color: '#FFFFFF',
                  fontWeight: GSFont.Semibold,
                  fontSize: 14
                },
                leftButtonBgStyle: {
                  bgColorNormal: '#F5F5F5'
                },
                rightButtonBgStyle: {
                  bgColorNormal: '#57B3E7'
                }
              }
            }
          />
          <LoadingDialog
            visible={this.state.isSameDialog}
            message={GSLocalize("acid57")}
            timeout={2000}
            onDismiss={(_) => this.setState({ "isSameDialog": false })}
          />
        </ScrollView>
      </View>
    );
  }
}