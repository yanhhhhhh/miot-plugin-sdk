/*
 * @Author: huayou.fu
 * @Created date: 2022-01-04 16:16:54
 */

import { MHCard, ModeCard, NavigationBar, Separator, SlideGear, Switch } from "mhui-rn";
import { Device, Service, DeviceEvent } from "miot";
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform } from "react-native";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { GSSpec, WIND } from "../../constants";
import { GSDevWarn } from "../../helper/GSLog";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
import { GSDeivce } from "../../models/device";
import { appExit, navigatePopPage, navigatePushPage } from "../../navigate";
import { hexToRGBA, IconStyles, MainScreen, mixin } from "../../styles";
import { GSFont } from "../../styles/font";
import LinearGradient from "react-native-linear-gradient";
import { GSImage } from "../../constants/image/image";
import { Styles } from "miot/resources";
import { ACControlVAL, ACMode, ACPower } from "../../constants/airconditioner";
import { ACStateCenter } from "../../manager/DeviceManager/GSACStateCenter";
import LottieView from 'lottie-react-native';
import { statusBarHeight } from "../../helper/system/app";
import { GSSystem } from "../../configuration/system";
import { HomePagePannelControl } from "./HomePagePannelControl";
import { GSLocalize, ExchangeTxtPosition } from "../../manager/LanguageManager/LanguageManager";
import { DateManagerMgr } from "../../helper/date/date";
import { LocalStorageMgr } from "../../manager/LocalStorageManager/LocalStorageManager";
import { PackageEvent } from "miot/Package";
export default class HomePage extends SafeAreaBaseContainer {

  constructor(props) {
    super(props);
    this.state = {
      deviceName: HomePagePannelControl.deviceName,
      unsupportControllerId: HomePagePannelControl.unsupportControllerId, // 当前的控制id是否可用
      windSelected: WIND.auto,
      tempValue: HomePagePannelControl.defaultTempValue,
      controlTempValue: HomePagePannelControl.defaultTempValue, // 控制时候的温度
      mode: HomePagePannelControl.mode,
      temps: HomePagePannelControl.getPannelData().temps, // 接口返回，温度的range
      speeds: HomePagePannelControl.getPannelData().speeds, // 接口返回,风速的支持range
      swing: HomePagePannelControl.getPannelData().swing, // 接口返回，扫风是否支持
      powerOn: false, // ACPower.off.value,
      swingOn: false, // 扫风开关
      windValue: WIND.auto.value, // 风速
      penelBrightnessEnable: HomePagePannelControl.defaultPanelBrightnessEnable,
      ElectricQuantity: '-', // 当前电量
      CurrentPower: '-', // 当前功率
      sleepModeOn: HomePagePannelControl.sleepModeOn, // 睡眠模式的默认开关
      supportPannelLight: HomePagePannelControl.supportPannelLight, // 是否支持面板开关
      fastColdOn: HomePagePannelControl.fastColdOn, // 速冷开关
      onTimeControlVal: HomePagePannelControl.onTimeControlVal, // 速冷开关
      onDelayControlVal: HomePagePannelControl.onDelayControlVal
    };
  }

  UNSAFE_componentWillMount() {
    // LocalStorageMgr.get(`${ Device.deviceID }_ElectricQuantity_${ DateManagerMgr.getFullDate() }`).then((res) => {
    //   let arr = Object.keys(res);
    //   if (arr.length) {
    //     this.setState({ "ElectricQuantity": res["ElectricQuantity"] });
    //   }
    // }).catch((err) => {

    // });
    DateManagerMgr.getDayPowerNumber().then((res) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>::::dddddddddddddddddddddddddddddddddddd::", res);
      let totalMonthPower = DateManagerMgr.CalculateTotalPower(res);
      LocalStorageMgr.set(`${ Device.deviceID }_ElectricQuantity_${ DateManagerMgr.getFullDate() }`, { "ElectricQuantity": totalMonthPower.toString() });
      this.setState({ ElectricQuantity: totalMonthPower.toString() });
    });
    LocalStorageMgr.get(`${ Device.deviceID }_CurrentPower_${ DateManagerMgr.getFullDate() }`).then((res) => {
      console.log(">>>>>>>>>>>>>>ddddddddddddddddddddddddddddddddddddd>>>>>>>>>>>>>>>>>>>>>>>>>???", res);
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
  async componentDidMount() {
    HomePagePannelControl.onUpdatePannel = (value) => {
      console.log('=========== Home udpate: ', value);
      this.setState({
        ...value
      });
      this.animationPlayControl(this.state.powerOn);// 开启动画
    };   
    HomePagePannelControl.initAirInfo();
    HomePagePannelControl.refreshAllAcControlStates();
    this.viewAppearListener = PackageEvent.packageViewWillAppear.addListener(() => {
      HomePagePannelControl.getTiming();// 刷新。
    });
    HomePagePannelControl.getTiming();
  }

  componentWillUnmount() {
    !!this.viewAppearListener && this.viewAppearListener.remove();
    HomePagePannelControl.removeListener();
    this.removeListener();
  }

    // 设置空调模式
    onSelectAcMode = (value) => {
      HomePagePannelControl.specSetMode(value.value);
    };

    // 电源开关
    onPressPowerOn = () => {
      const { powerOn } = this.state;
      HomePagePannelControl.specSetPowerOn(!powerOn);
    }

    // 设置温度
    setTemp = (index) => {
      const { temps } = this.state;
      if (temps.length > 1) {
        let min = temps[0];
        let max = temps[temps.length - 1];
        if (index < temps.length) {
          let tem = temps[index];
          if (tem < min || tem > max) {
            return;
          }
          HomePagePannelControl.onDoMannulControlSemaphore();
          HomePagePannelControl.specSetTemp(tem);
        }
      }
    }

    // 设置扫风开关
    onPressSwingOn = (enable) => {
      HomePagePannelControl.specSetSwingOn(enable);
    }
    
    // 设置风速
    onSelectWindValue = (val) => {
      HomePagePannelControl.specSetWindValue(val.value);
    }

    // 设置面板灯光
    onSwithPannelBrightness = (enable) => {
      HomePagePannelControl.specSetPanelBrightnessEnable(enable);
    }

    animationPlayControl = (powerOn) => {
      if (powerOn) {
            this.animation?.play();
      } else {
            this.animation?.reset();
      }
    }

    // 统计跳转
    onPressStatistics = () => {
      navigatePushPage(this, 'ElectricStatistics', {});
    }

    // 舒适模式
    onPressComfyMode = () => {
      HomePagePannelControl.turnOnComfyMode();
    }

    isCurrentComfyMode = () => {
      const { mode, tempValue, swingOn, windValue, swing } = this.state;
      let value = mode === ACMode.cold.value && tempValue === 28 && windValue === WIND.auto.value;
      const { type: swingType } = swing; 
      if (swingType === 2) {
        value = value && swingOn === true;
      }
      return value;  
    }

    // 速冷跳转
    onFastCoolingPress = () => {
      navigatePushPage(this, 'FastCooling');
    };

    // 安睡模式跳转
    onPressSleepMode = () => {
      navigatePushPage(this, 'SleepMode', {});
    };

    // 定时
    onPressTiming = () => {
      navigatePushPage(this, 'Timing', {});
    }

    // 安睡模式跳转
    onPressDelayClose = () => {
      navigatePushPage(this, 'DelayClose', {});
    }
    // 定时
    // [{ did: Device.deviceID, siid: GSSpec.siid12.is_insert_air.siid, piid: GSSpec.siid12.is_insert_air.piid }];
    openTimerSettingPageWithOptions() {
      let onParam = [{ did: Device.deviceID, piid: GSSpec.siid3.on.piid, siid: GSSpec.siid3.on.siid, value: true }];
      let offParam = [{ did: Device.deviceID, piid: GSSpec.siid3.on.piid, siid: GSSpec.siid3.on.siid, value: false }];
      let params = {
        onMethod: "set_properties",
        onParam: JSON.stringify(onParam),
        offMethod: "set_properties",
        offParam: JSON.stringify(offParam),
        timerTitle: GSLocalize('acid28'),
        displayName: GSLocalize('acid28'),
        identify: "identify_1",
        onTimerTips: '',
        offTimerTips: GSLocalize('acid28'),
        listTimerTips: GSLocalize('acid28'),
        bothTimerMustBeSet: false,
        showOnTimerType: false,
        showOffTimerType: false,
        showPeriodTimerType: false
      };
      Service.scene.openTimerSettingPageWithOptions(params);
    }

    // 倒计时
    openCountDownPage() {
      let onParam = [{ did: Device.deviceID, piid: GSSpec.siid3.on.piid, siid: GSSpec.siid3.on.siid, value: true }];
      let offParam = [{ did: Device.deviceID, piid: GSSpec.siid3.on.piid, siid: GSSpec.siid3.on.siid, value: false }];
      let params = {
        onMethod: "set_properties",
        offMethod: 'set_properties',
        onParam: JSON.stringify(onParam),
        offParam: JSON.stringify(offParam),
        identify: "custom",
        displayName: '自定义名称'
      };
      Service.scene.openCountDownPage(true, params);
    }

    /**
     * 为了实现 头部设置的渲染，必须实现render
     */
    render() {
      const { powerOn, onDelayControlVal } = this.state;
      // 设置导航栏
      let subtitle = (onDelayControlVal.value !== undefined && onDelayControlVal.value !== '') ? onDelayControlVal.value : undefined;
      this.setDefaultNavibar({
        title: this.state.deviceName, // GSLocalize('acid2'),
        onback: () => appExit(),
        needRight: true,
        rightIcon: 'MORE',
        onRightPress: () => { navigatePushPage(this, 'Setting', { from: 'Home' }); }
        // subtitle : subtitle
      });
      // 设置背景颜色
      this.baseSetBackgroundColor('#F7F7F7');
      this.baseRemoveTopNaviMargin();

      // 设置背景view
      let bg = powerOn ? { color: '#00D3BE', opacity: 1.0, color1: '#00D3BE', opacity1: 0.0 } : { color: '#324F60', opacity: 1.0, color1: '#324F60', opacity1: 0.0 };
      if (GSSystem.isDarkMode()) { // 黑暗模式
        bg = powerOn ? { color: '#003934', opacity: 1.0, color1: '#000000', opacity1: 1.0 } : { color: '#324F60', opacity: 0.2, color1: '#000000', opacity1: 1.0 };
      }
      this.setDefaultGradientBackground(bg.color, bg.opacity, bg.color1, bg.opacity1);

      // 插入动画
      this.setACAnimateView(powerOn ? <View style={{ position: 'absolute', width: MainScreen.width, height: 500, marginTop: -80 }}>
        <LottieView
          loop={true}
          ref={(animation) => {
            this.animation = animation;
          }}
          style = {{
            /* 解决空报错 */
          }} 
          source={require('../../../resources/images/homeAnimate.json')}
        />
      </View> : <View/>);
      return super.render();
    }

    gsRender() {
      const { unsupportControllerId, windSelected, tempValue, controlTempValue, mode, powerOn, temps, swing, speeds, swingOn, windValue, penelBrightnessEnable, sleepModeOn, supportPannelLight, fastColdOn, onTimeControlVal, onDelayControlVal } = this.state;
      
      let showMode = mode;
      if (unsupportControllerId) {
        showMode = -1;
      }
      let isComfyMode = this.isCurrentComfyMode();
      console.log('========== sleepModeOn: ', sleepModeOn);
      // 模式title
      let modeName = ACMode.title(mode);
      // 扫风title
      let swingOnName = swingOn ? GSLocalize("acid69") : GSLocalize("acid70");
      // 风速
      let windValueName = WIND.title(windValue);
      let iSpeeds = (!speeds || speeds.length < 2) ? HomePagePannelControl.defaultWindTypes : speeds;

      // mode 空调模式
      let currentModes = HomePagePannelControl.getModesFromFeatures();
      let iModes = currentModes.length > 2 ? currentModes : HomePagePannelControl.defaultModes;

      // 扫风
      const { type: swingType } = swing; 

      let tempsRange = HomePagePannelControl.temControlRange(temps);
      let unitText = Platform.OS === 'ios' ? '°C' : '°c'; // 有的安卓无法显示： °C ， 很奇怪。
      return <View style={styles.container}>
        {/* 中间的很大的温度 */}
        {/* <TouchableOpacity style={styles.temContainer} onPress={() => { //测试入口
          navigatePushPage(this, 'FuTesting');
        }}>
          <Text style={styles.temText}>{`${ tempValue }`}</Text>
          <Text style={styles.temUit}>{'°C'}</Text>
        </TouchableOpacity> */}
        <View style={styles.temContainer}>
          <Text style={styles.temText}>{`${ tempValue === -1 ? '--' : tempValue }`}</Text>
          {tempValue != -1 && <Text style={styles.temUit}>{unitText}</Text>}
        </View>
        

        {/* 制冷 ｜ 扫风关 ｜ 风速低 */}
        <View style={styles.stateContiner}>
          <Text style={styles.stateText}>{modeName}</Text>
          <Text style={styles.stateText}>{'｜'}</Text>
          <Text style={styles.stateText}>{ExchangeTxtPosition(GSLocalize("acid15"), windValueName)}</Text>
          <Text style={styles.stateText}>{'｜'}</Text>
          <Text style={styles.stateText}>{swingOnName}</Text>
        </View>

        {/* 今日电量，当月电量，当前功率 */}
        <TouchableOpacity style={styles.consumptionCellContainer} onPress={
          () => { this.onPressStatistics(); }
        }>
          <View style={styles.consumptionCell}>
            <Text style={styles.consumptionCellValue}>{this.state.ElectricQuantity}</Text>
            <Text style={styles.consumptionCellDes}>{GSLocalize("acid42")}</Text>
          </View>
          <View style={[styles.consumptionCell, { width: 1, height: 44, backgroundColor: '#E5E5E5' }]} />
          <View style={styles.consumptionCell}>
            <Text style={styles.consumptionCellValue}>{this.state.CurrentPower}</Text>
            <Text style={styles.consumptionCellDes}>{GSLocalize("acid43")}</Text>
          </View>
        </TouchableOpacity>

        {/* 电源开关 */}
        <View style={styles.powerContainer}>
          <MHCard
            title={GSLocalize("acid3")}
            titleStyle={{ color: '#333333', fontWeight: GSFont.Semibold, fontSize: 18 }}
            cardType={MHCard.CARD_TYPE.NORMAL}
            hideArrow={true}
            cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
            icon={powerOn ? GSImage.powerOn : GSImage.powerOff}
            onValueChange={(value) => console.log(value)}
            switchValue={true}
            tintColor="#ececec"
            onTintColor="#4e93fe"
            showShadow={true}
            marginTop={0}
            onPress={() => { this.onPressPowerOn(); }}
            cardStyle={{ borderRadius: 12, width: contentWidth, height: 82, backgroundColor: 'transparent', marginTop: 0 }}
          />
        </View>

        {/* 舒适模式 */}
        <View style={styles.acLightContainer}>
          <MHCard
            title={GSLocalize("acid135")}
            titleStyle={{ color: '#333333', fontSize: 16, fontWeight: GSFont.Semibold }}
            cardType={MHCard.CARD_TYPE.NORMAL}
            cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
            onValueChange={(value) => console.log(value)}
            switchValue={true}
            tintColor="#E5E5E5"
            onTintColor="#00D3BE"
            showShadow={true}
            marginTop={0}
            hideArrow ={true}
            icon={isComfyMode ? GSImage.comfyOn : GSImage.comfy}
            iconStyle={{ ...IconStyles.size42 }}
            cardStyle={{ borderRadius: 12, width: contentWidth, height: 82, backgroundColor: 'white', marginTop: 0 }}
          />
          <TouchableOpacity style = {{ position: 'absolute', width: 80, height: 34, borderRadius: 22, backgroundColor: hexToRGBA('#00D3BE', 0.1), right: 20, justifyContent: 'center', alignItems: 'center' }} onPress = {
            () => {
              this.onPressComfyMode();
            }
          }>
            <Text style = {{ color: hexToRGBA('#00D3BE', isComfyMode ? 0.3 : 1), fontSize: 13, fontWeight: GSFont.Semibold }}>{isComfyMode ? GSLocalize("acid134") : GSLocalize("acid126")}</Text>
          </TouchableOpacity>
          {
            (!powerOn || unsupportControllerId) && ACTurnOffMask 
          }
        </View>

        {/* 速冷模式 */}
        <View style={styles.acLightContainer}>
          <MHCard
            title={GSLocalize("acid136")}
            titleStyle={{ color: '#333333', fontSize: 16, fontWeight: GSFont.Semibold }}
            cardType={MHCard.CARD_TYPE.NORMAL}
            cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
            onValueChange={(value) => console.log(value)}
            switchValue={true}
            tintColor="#E5E5E5"
            onTintColor="#00D3BE"
            showShadow={true}
            marginTop={0}
            icon={fastColdOn ? GSImage.fastCoolingOn : GSImage.fastCooling}
            iconStyle={{ ...IconStyles.size42 }}
            cardStyle={{ borderRadius: 12, width: contentWidth, height: 82, backgroundColor: 'white', marginTop: 0 }}
            onPress={() => {
              this.onFastCoolingPress();
            }}
          />
          {
            (!powerOn || unsupportControllerId) && ACTurnOffMask
          }
        </View>


        {/* 温度调节 */}
        <View style={styles.temControlContainer}>
          <View style={{ paddingTop: 16, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: contentWidth - 40, height: 42 }}>
            <Text style={styles.temControlText}>{GSLocalize("acid65")}</Text>
            <View style={{ width: 1, height: 14, backgroundColor: '#999999', marginLeft: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: GSFont.Regular, color: '#7F7F7F', lineHeight: 22, marginLeft: 6 }}>{`${ tempValue }°C`}</Text>
          </View>
          <View style={{ height: 92, width: '100%', justifyContent: 'center', alignItems: 'center', width: contentWidth - 40 }}>
            <View style={{ width: '100%', height: 48, backgroundColor: '#F5F5F5', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => {
                this.setTemp(tempsRange.indexOf(tempValue) - 1);
              }} style={{ ...IconStyles.size42, width: 42, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={GSImage.temperatureMinus} style={{ ...IconStyles.size42, marginLeft: 3 }} />
              </TouchableOpacity>
              <View style={{ width: 2, height: 48, backgroundColor: 'white' }} />
              <SlideGear // contentType="color"
                type={SlideGear.TYPE.RECTANGLE}
                showEndText={true}
                leftTextColor = {'#ffffff'}
                rightTextColor = {'#7F7F7F'}
                options={tempsRange}// tempsRange
                blockStyle={{ width: 4, height: 32, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: 'white' }}
                value={tempsRange.indexOf(tempValue)}
                containerStyle={{ width: MainScreen.width - 152, height: 48 }}
                onValueChange={(val) => {}}
                onSlidingComplete={(index) => {
                  this.setTemp(index);
                }}
                minimumTrackTintColor="#00D3BE"
                maximumTrackTintColor="#F5F5F5"
              />
              <View style={{ width: 2, height: 48, backgroundColor: 'white' }} />
              <TouchableOpacity style={{ ...IconStyles.size42, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => {
                  this.setTemp(tempsRange.indexOf(tempValue) + 1);
                }}>
                <Image source={GSImage.temperatureAdd} style={{ ...IconStyles.size42, marginLeft: -3 }}></Image>
              </TouchableOpacity>
            </View>
          </View>
          {
            (!powerOn || !temps) && ACTurnOffMask
          }
        </View>
        {/* ============== 风速 ============== */}
        <View style={styles.windContainer}>
          <View style={{ paddingTop: 16, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: contentWidth - 40, height: 42 }}>
            <Text style={styles.temControlText}>{GSLocalize("acid15")}</Text>
            <View style={{ width: 1, height: 14, backgroundColor: '#999999', marginLeft: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: GSFont.Regular, color: '#7F7F7F', lineHeight: 22, marginLeft: 6 }}>{windValueName}</Text>
          </View>
          <View style={{ ...styles.windIconsContainer, paddingHorizontal: iSpeeds.length == 3 ? 10 : 0 }}>
            {
              iSpeeds.map((val, index) => {
                let tWind = WIND.type(val);
                return <TouchableOpacity key={index} onPress={() => {
                  this.onSelectWindValue(tWind);
                }} style={{ ...styles.windIconsCell, width: (MainScreen.width - (iSpeeds.length == 3 ? 20 + 24 : 24)) / iSpeeds.length }}>
                  <Image source={windValue == tWind.value ? GSImage[`wind${ tWind.upper }Selected`] : GSImage[`wind${ tWind.upper }`]} style={IconStyles.size48} />
                  <Text style={[styles.windText, { color: windValue == tWind.value ? '#00D3BE' : '#999999' }]}>{tWind.name}</Text>
                </TouchableOpacity>;
              })
            }
            { 
              // 个数为2: 添加 分隔线。
              iSpeeds.length == 2 && <View style={{ position: 'absolute', top: 24, marginLeft: (contentWidth - 25.0) / 2.0, backgroundColor: '#E5E5E5', width: 1, height: 48 }} />
            }
          </View>
          {
            // 遮罩，不可用蒙版。
            (!powerOn || !speeds || speeds.length == 1) && ACTurnOffMask
          }
        </View>

        {/* 面板灯光 */}
        {
          !!supportPannelLight && <View style={styles.acLightContainer}>
            <MHCard
              title={GSLocalize("acid66")}
              titleStyle={{ color: '#333333', fontSize: 16, fontWeight: GSFont.Semibold }}
              cardType={MHCard.CARD_TYPE.SWITCH}
              cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
              onValueChange={(value) => this.onSwithPannelBrightness(value)}
              switchValue={penelBrightnessEnable}
              tintColor="#E5E5E5"
              onTintColor="#00D3BE"
              showShadow={true}
              marginTop={0}
              icon={penelBrightnessEnable ? GSImage.ACLightOn : GSImage.ACLight}
              cardStyle={{ borderRadius: 12, width: MainScreen.width - 40, height: 80, backgroundColor: 'transparent', marginTop: 0 }}
            />
            {
              !powerOn && ACTurnOffMask
            }
          </View>
        }

        {/* 扫风 */}
        {
          swingType == 2 && <View style={styles.acLightContainer}>
            <MHCard
              title={GSLocalize("acid20")}
              titleStyle={{ color: '#333333', fontSize: 16, fontWeight: GSFont.Semibold }}
              cardType={MHCard.CARD_TYPE.SWITCH}
              cardRadiusType={MHCard.CARD_RADIUS_TYPE.ALL}
              onValueChange={
                () => this.onPressSwingOn(!swingOn)
              }
              switchValue={swingOn}
              tintColor="#E5E5E5"
              onTintColor="#00D3BE"
              showShadow={true}
              marginTop={0}
              icon={swingOn ? GSImage.SweptWindOn : GSImage.SweptWind}
              cardStyle={{ borderRadius: 12, width: MainScreen.width - 40, height: 80, backgroundColor: 'transparent', marginTop: 0 }}
            />
            {
              !powerOn && ACTurnOffMask
            }
          </View>
        }

        {/* 模式-制冷，制热... */}
        <View style={styles.modelContainer}>
          <View style={{ paddingTop: 16, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: contentWidth - 40, height: 42 }}>
            <Text style={styles.temControlText}>{GSLocalize("acid21")}</Text>
            <View style={{ width: 1, height: 14, backgroundColor: '#999999', marginLeft: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: GSFont.Regular, color: '#7F7F7F', lineHeight: 22, marginLeft: 6 }}>{modeName}</Text>
          </View>
          <View style={{ ...styles.modelIconsContainer, paddingHorizontal: iModes.length == 3 ? 10 : 0 }}>
            {
              iModes.map((val) => {
                let tMode = ACMode.mode(val);
                return <TouchableOpacity key={val} onPress={() => {
                  this.onSelectAcMode(tMode);
                }} style={{ ...styles.modelIconsCell, width: (MainScreen.width - 24) / iModes.length }}>
                  <Image source={showMode == tMode.value ? GSImage[`ACMode${ tMode.upper }On`] : GSImage[`ACMode${ tMode.upper }`]} style={IconStyles.size48} />
                </TouchableOpacity>;
              })
            }
            { 
              // 个数为2: 添加 分隔线。
              iModes.length == 2 && <View style={{ position: 'absolute', marginLeft: (contentWidth - 25.0) / 2.0, backgroundColor: '#E5E5E5', width: 1, height: 42 }} />
            }
          </View>
          {
            (!powerOn || unsupportControllerId) && ACTurnOffMask 
          }
        </View>


        {/* 安睡模式，定时，延迟关空调 */}
        <View style={styles.sleepModeContainer}>
          <View>
            <MHCard
              title={GSLocalize("acid67")}
              titleStyle={styles.sleepModeTitle}
              cardType={MHCard.CARD_TYPE.NORMAL}
              cardRadiusType={MHCard.CARD_RADIUS_TYPE.NONE}
              onValueChange={(value) => console.log(value)}
              onPress={() => { this.onPressSleepMode(); }}
              switchValue={this.state.value}
              tintColor="black"
              onTintColor="#67b688"
              marginTop={0}
              icon={sleepModeOn ? GSImage.SleepModeOn : GSImage.SleepMode}
              cardStyle={{ width: contentWidth, borderTopRightRadius: 12, borderTopLeftRadius: 12, marginTop: 0, height: 82, backgroundColor: 'transparent' }}
            />
            {
              unsupportControllerId && ACTurnOffMask
            }
          </View>
          <Separator style={{ height: 1, width: MainScreen.width - 64 }} />
          <View>
            <MHCard title={GSLocalize("acid28")}
              titleStyle={styles.sleepModeTitle}
              subtitle={onTimeControlVal.value}
              subtitleStyle={{ color: '#666666', fontSize: 13, lineHeight: 16, fontWeight: GSFont.Regular }}
              onValueChange={(value) => console.log(value)}
              switchValue={this.state.value}
              onTintColor="#67b688"
              cardType={MHCard.CARD_TYPE.NORMAL}
              cardRadiusType={MHCard.CARD_RADIUS_TYPE.NONE} // 无圆角
              onPress={() => { this.openTimerSettingPageWithOptions(); }}
              icon={onTimeControlVal.on ? GSImage.timingOn : GSImage.timing}
              cardStyle={{ width: contentWidth, marginTop: 0, height: 82 }}
            />
          </View>
          <Separator style={{ height: 1, width: MainScreen.width - 64 }} />
          <View>
            <MHCard title={GSLocalize("acid68")}
              titleStyle={styles.sleepModeTitle}
              subtitle={onDelayControlVal.value}
              // subtitle={'1' + GSLocalize('acid100') + ' '  + GSLocalize('acid49')}
              subtitleStyle={{ color: '#666666', fontSize: 13, lineHeight: 16, fontWeight: GSFont.Regular }}
              switchValue={this.state.value}
              onTintColor="#67b688"
              onValueChange={(value) => console.log(value)}
              cardType={MHCard.CARD_TYPE.NORMAL}
              showShadow={false}
              cardRadiusType={MHCard.CARD_RADIUS_TYPE.NONE}
              onPress={() => { this.openCountDownPage(); }}
              icon={onDelayControlVal.on ? GSImage.DelayCloseOn : GSImage.DelayClose}
              cardStyle={{ width: contentWidth, borderBottomRightRadius: 12, borderBottomLeftRadius: 12, backgroundColor: 'white', marginTop: 0, height: 82 }}
            />
            {
              !powerOn && ACTurnOffMask
            }
          </View>
        </View>
      </View>;
    }
}

/**
 * 不可用蒙版
 */
const ACTurnOffMask = <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: hexToRGBA('#ffffff', 0.7), borderRadius: 12 }} />;


const contentWidth = MainScreen.width - 24;
const styles = StyleSheet.create({

  container: {
    width: MainScreen.width,
    height: '100%',
    alignItems: 'center',
    marginBottom: 40
  },

  // 头部的背景
  backgound: {
    width: MainScreen.width,
    marginTop: 0,
    marginLeft: 0,
    height: 812,
    position: 'absolute'
  },

  // 大温度
  temContainer: {
    width: MainScreen.width - 24,
    height: 148,
    marginTop: 60, // mixin.zoom(60),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  temText: {
    color: '#ffffff',
    fontSize: 106,
    lineHeight: 148,
    fontWeight: GSFont.Medium,
    marginLeft: 15
  },

  temUit: {
    color: '#ffffff',
    fontWeight: GSFont.Regular,
    fontSize: 29,
    width: 31,
    height: 40,
    lineHeight: 40,
    marginTop: -60
  },

  stateContiner: {
    height: 22,
    width: (MainScreen.width - 24.0),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },

  stateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: GSFont.Regular,
    textAlign: 'center',
    lineHeight: 22
  },

  consumptionCellContainer: {
    marginTop: mixin.zoom(80),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },

  consumptionCell: {
    width: '50%',
    height: 96,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  consumptionCellValue: {
    fontSize: 32,
    color: '#4C4C4C',
    lineHeight: 32,
    height: 40,
    marginTop: 20
  },

  consumptionCellDes: {
    marginTop: 4,
    marginBottom: 16,
    height: 16,
    lineHeight: 16,
    fontSize: 12,
    color: '#7F7F7F',
    fontWeight: GSFont.Regular
  },

  // 开关
  powerContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 82,
    borderRadius: 12,
    backgroundColor: 'white'
  },

  powerImage: {
    width: 42,
    height: 42,
    marginLeft: 20,
    borderRadius: 20,
    backgroundColor: 'red'
  },

  powerText: {
    marginLeft: 10,
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
    lineHeight: 20
  },

  // 舒适，速冷
  comfyCellContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },

  comfyCell: {
    width: '50%',
    height: 96,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },


  // 温度调节
  temControlContainer: {
    marginTop: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 134,
    borderRadius: 12,
    backgroundColor: 'white'
  },

  temControlText: {
    fontWeight: GSFont.Semibold,
    fontSize: 16,
    lineHeight: 22,
    height: 22
  },


  temControlBar: {
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 风速
  windContainer: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    width: contentWidth,
    height: 160,
    borderRadius: 12,
    backgroundColor: 'white'
  },

  windIconsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: MainScreen.width - 40,
    height: 118
  },

  windIconsCell: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    width: (MainScreen.width - 24) / 4.0
  },

  windIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white'
  },

  windText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999999',
    fontWeight: GSFont.Semibold,
    lineHeight: 18
  },

  // 速冷
  acLightContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: MainScreen.width - 24,
    height: 82,
    borderRadius: 12,
    backgroundColor: 'white'
    // paddingLeft: 20,
  },

  // 模式 制冷，制热，自动，送风，除湿 ...
  modelContainer: {
    marginTop: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    width: contentWidth,
    height: 128,
    borderRadius: 12,
    backgroundColor: 'white'
  },

  modelIconsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: MainScreen.width - 40,
    height: 86,
    backgroundColor: 'white'
  },

  modelIconsCell: {
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    width: (MainScreen.width - 24) / 5.0
  },

  modelCellsContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  // 安睡模式
  sleepModeContainer: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 20,
    width: MainScreen.width - 24
  },

  sleepModeTitle: {
    color: '#333333',
    fontWeight: GSFont.Semibold,
    fontSize: 16
  }

});