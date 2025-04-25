import React from 'react';
import { Service, Device, Host, PackageEvent, Resources } from 'miot';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { CommonSetting, SETTING_KEYS } from 'miot/ui/CommonSetting';
import SafeAreaBaseContainer from '../../components/SafeArea/SafeAreaBaseContainer';
import Separator from 'miot/ui/Separator';
import Protocol from '../../../resources/protocol';
import { strings as SdkStrings, Styles as SdkStyles } from 'miot/resources';
import { ListItem } from 'miot/ui/ListItem';
import PluginStrings from '../../../resources/strings';
import NavigationBar from 'miot/ui/NavigationBar';
import { LocalStorageMgr } from '../../manager/LocalStorageManager/LocalStorageManager';
import { appExit, navigatePopPage, navigatePushPage } from '../../navigate';
import { AirControllerPannelMgr } from '../../manager/DeviceManager/AirControllerPannelManager';
import MessageDialog from 'miot/ui/Dialog/MessageDialog';
import GSDialogPage from '../../components/dialog/GSDialog';
import { GSIRAirconditionerMgr } from '../../manager/DeviceManager/GSIRAirconditionerMgr';
import { GSDeivce } from '../../models/device';
import { GSLocalize } from '../../manager/LanguageManager/LanguageManager';
import { GSSpec } from '../../constants/protocol/spec';
import { GSSystem } from '../../configuration/system';

export default class SettingPage extends SafeAreaBaseContainer {
  constructor(prop) {
    super(prop);
    this.state = {
      protocol: null,
      controller_id: '', // controller_id
      brand_name: '', // 品牌名称
      airSelectedPos: '', // 位置
      showDialog: false, // 显示提示框
      lightSwitch: false,
      doNotDisturbModel: false,
      lightStatusInfo: '', // 指示灯 提醒文字
      startTimeMinute: 0,
      endTimeMinute: 0
    };
  }
  UNSAFE_componentWillMount() {}
  componentDidMount() {
    this.enableLoadingActivity(true);
    this.viewFocusListener = this.props.navigation.addListener(
      'didFocus',
      (_) => {
        console.log(' ========== componentDidMount   viewFocusListener ======');
        console.log('xxxxxxxxxxxxxxx');
        console.log('contr', GSDeivce.irConroller);
        console.log(GSDeivce.brand);
        this.getIndicatorLightInfo();
        this.getBrandAndPos();
        this.getBrand(GSDeivce.brand.id);
      }
    );
    this.viewAppearListener = PackageEvent.packageViewWillAppear.addListener(
      () => {
        console.log(
          ' ========== viewAppearListener  componentDidMount   viewAppearListener ======'
        );
        this.getBrand(GSDeivce.brand.id);
        this.getBrandAndPos();
        this.getIndicatorLightInfo();
        console.log('ddddd>>>>>>>>>>>>>>>>>>>>>>dddddd');
      }
    );
    this.initCommonSettingParams();
    this.initProtocol();
  }

  componentWillUnmount() {
    console.log('==========SettingPage: componentWillUnmount ======');
    this.unmount = true;
    if (this.viewFocusListener) {
      this.viewFocusListener.remove();
      this.viewFocusListener = null;
    }
    if (this.viewAppearListener) {
      this.viewAppearListener.remove();
      this.viewAppearListener = null;
    }
  }

  initCommonSettingParams() {
    this.commonSettingParams = {
      firstOptions: [
        SETTING_KEYS.first_options.SHARE,
        SETTING_KEYS.first_options.IFTTT,
        SETTING_KEYS.first_options.FIRMWARE_UPGRADE,
        SETTING_KEYS.first_options.MORE
      ],
      secondOptions: [
        SETTING_KEYS.second_options.TIMEZONE,
        SETTING_KEYS.second_options.SECURITY
      ],
      extraOptions: {
        option: '',
        showUpgrade: true
      }
    };
  }

  UNSAFE_componentWillMount() {
    this.initCommonSettingParams();
    this.initProtocol();
  }
  getBrand(brandId) {
    // 获取品牌
    let lan = Resources.getLanguage();
    LocalStorageMgr.get(`brand_${ Device.deviceID }_${ brandId }_${ lan }`)
      .then((ress) => {
        let keys = Object.keys(ress);
        console.log('length:', keys.length, keys);
        if (keys.length == 0) {
          GSIRAirconditionerMgr.getIrBrand(brandId)
            .then((res) => {
              if (res.code == 0 && !this.unmount) {
                if (lan == 'zh') {
                  GSDeivce.brand.name = res.result.name;
                  LocalStorageMgr.set(
                    `brand_${ Device.deviceID }_${ brandId }_${ lan }`,
                    { brand_name: res.result.name }
                  );
                  this.setState({
                    brand_name: res.result.name
                  });
                } else {
                  GSDeivce.brand.name = res.result.en_name;
                  LocalStorageMgr.set(
                    `brand_${ Device.deviceID }_${ brandId }_${ lan }`,
                    { brand_name: res.result.en_name }
                  );
                  this.setState({
                    brand_name: res.result.en_name
                  });
                }
              }
            })
            .catch((err) => {
              console.log('err11');
              console.log(err);
            });
        } else {
          console.log(
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
          );
          this.setState({
            brand_name: ress.brand_name
          });
        }
      })
      .catch((err) => {
        console.log('get brand error');
      });
    // GSIRAirconditionerMgr.getIrBrand(brandId).then((res) => {

    //   if (res.code == 0 && !this.unmount) {
    //     if (lan == "zh") {
    //       GSDeivce.brand.name = res.result.name;
    //       this.setState({
    //         "brand_name": res.result.name
    //       });
    //     } else {
    //       GSDeivce.brand.name = res.result.en_name;
    //       this.setState({
    //         "brand_name": res.result.en_name
    //       });
    //     }
    //     LocalStorageMgr.set("brand_" + Device.deviceID + "_"+brandId + "_" +lan,{"brand_name":brand_name});
    //   }
    // }).catch((err) => {
    //   console.log("err11");
    //   console.log(err);
    // });
  }
  // 获取缓存品牌，空调位置相关信息
  getBrandAndPos() {
    // let brandInfo = "";
    // LocalStorageMgr.get("controllerIdAndBrand").then((res) => {
    //   this.setState({ brand_name: res.brand_name ? res.brand_name : "" });
    //   this.setState({ controller_id: res.controller_id ? res.controller_id : "" });
    // }).catch((err) => {

    // });
    this.setState({ controller_id: GSDeivce.irConroller.id });
    let airSelectedPos = '';
    LocalStorageMgr.get('airSelectedInfo')
      .then((res) => {
        console.log('tttt:', res, res.airSelectedPos);
        if (res && res.airSelectedPos == 0) {
          airSelectedPos = GSLocalize('acid31');
        } else if (res && res.airSelectedPos == 1) {
          airSelectedPos = GSLocalize('acid32');
        }
        this.setState({ airSelectedPos: airSelectedPos });
      })
      .catch((err) => {
        console.log('err');
      });
  }
  initProtocol() {
    Protocol.getProtocol()
      .then((protocol) => {
        this.setState({
          protocol: protocol
        });
      })
      .catch((error) => {
        // 错误信息上报， 通过米家app反馈可以上报到服务器
        Service.smarthome.reportLog(
          Device.model,
          `Service.getServerName error: ${ JSON.stringify(error) }`
        );
      });
  }
  JumpSettingCode() {
    this.setState({ showDialog: false });
    navigatePushPage(this, 'SetControllID', {
      from: 'Setting',
      style: 'Coding',
      Title: GSLocalize('acid30')
    });
  }
  getIndicatorLightInfo() {
    let params = [
      {
        did: GSDeivce.did,
        siid: GSSpec.siid10.status.siid,
        piid: GSSpec.siid10.status.piid
      },
      {
        did: GSDeivce.did,
        siid: GSSpec.siid10.model.siid,
        piid: GSSpec.siid10.model.piid
      },
      {
        did: GSDeivce.did,
        siid: GSSpec.siid10.start_time.siid,
        piid: GSSpec.siid10.start_time.piid
      },
      {
        did: GSDeivce.did,
        siid: GSSpec.siid10.end_time.siid,
        piid: GSSpec.siid10.end_time.piid
      }
    ];
    Service.spec
      .getPropertiesValue(params)
      .then((res) => {
        if (this.unmount) {
          console.log('true....................................');
          return;
        }
        console.log('false.............................................');
        console.log('res:====>', res);
        let setStates = {};
        if (res[0].code == 0) {
          setStates['lightSwitch'] = res[0].value;
        }
        if (res[1].code == 0) {
          setStates['doNotDisturbModel'] = res[1].value;
        }
        if (res[2].code == 0) {
          setStates['startTimeMinute'] = res[2].value;
        } else {
          setStates['startTimeMinute'] = 0;
        }
        if (res[3].code == 0) {
          setStates['endTimeMinute'] = res[3].value;
        }
        setStates['lightStatusInfo'] = this.lightStatusInfo(setStates);
        console.log('====== IndicatorLightInfo: ', setStates);
        this.setState({
          ...setStates
        });
        this.enableLoadingActivity(false);
      })
      .catch((err) => {
        console.log('errrrrrrr');
        console.log(err);
        this.enableLoadingActivity(false);
      });
  }
  lightStatusInfo(setStates) {
    let info = GSLocalize('acid49');
    if (setStates['lightSwitch']) {
      if (setStates['doNotDisturbModel']) {
        let startTimeMinute = this.AllMinuteToHourAndMinute(
          setStates['startTimeMinute']
        );
        let endTimeMinute = this.AllMinuteToHourAndMinute(
          setStates['endTimeMinute']
        );
        if (setStates['startTimeMinute'] < setStates['endTimeMinute']) {
          // 同一天
          info = `${ startTimeMinute.join(':') }-${ endTimeMinute.join(
            ':'
          ) } ${ GSLocalize('acid127') }`;
        } else {
          // 第二天
          info = `${ startTimeMinute.join(':') }-${ GSLocalize(
            'acid56'
          ) }${ endTimeMinute.join(':') } ${ GSLocalize('acid127') }`;
        }
      } else {
        info = GSLocalize('acid126');
      }
    }
    return info;
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
  render() {
    // 设置导航栏
    this.setDefaultNavibar({
      type: 'LIGHT',
      title: GSLocalize('acid124'),
      titleStyle: {
        color: '#000000',
        fontSize: 18
      },
      onback: () => {
        navigatePushPage(this, 'Home');
      }
    });
    let bgColor = GSSystem.isDarkMode() ? '#F7F7F7' : '#ffffff';
    this.baseSetBackgroundColor(bgColor);
    return super.render();
  }
  gsRender() {
    if (!this.state.protocol) {
      return null;
    }

    this.commonSettingParams.extraOptions.option = this.state.protocol;
    let bgColor = GSSystem.isDarkMode() ? '#F7F7F7' : '#ffffff';
    return (
      <View style={styles.container}>
        <MessageDialog
          visible={this.state.showDialog}
          title={GSLocalize('acid52')}
          message={GSLocalize('acid53')}
          buttons={[
            {
              text: GSLocalize('acid54'),
              style: { color: 'lightpink' },
              callback: (_) => this.setState({ showDialog: false })
            },
            {
              text: GSLocalize('acid51'),
              style: { color: 'lightblue' },
              callback: (_) => this.JumpSettingCode()
            }
          ]}
        />
        <Separator />
        <ScrollView
          style={{ flex: 1, backgroundColor: bgColor }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: 'transparent',
              height: 32,
              justifyContent: 'center',
              paddingLeft: SdkStyles.common.padding
            }}
          >
            <Text
              style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', lineHeight: 14 }}
            >
              {SdkStrings.featureSetting}
            </Text>
          </View>
          {/* 工作模式 */}
          <ListItem
            title={PluginStrings.workModel}
            value={this.state.airSelectedPos}
            showSeparator={false}
            onPress={() => {
              navigatePushPage(this, 'SetControllID', {
                from: 'Setting',
                style: 'setModel',
                Title: GSLocalize('acid30')
              });
            }}
          />
          {/* 当前匹配 */}
          <ListItem
            title={PluginStrings.currentMatch}
            value={this.state.brand_name + this.state.controller_id}
            showSeparator={false}
            onPress={() => {
              this.setState({ showDialog: true });
            }}
          />
          {/* 指示灯状态 */}
          <ListItem
            title={PluginStrings.IndicatorLightStatus}
            showSeparator={false}
            value={this.state.lightStatusInfo}
            onPress={() => {
              navigatePushPage(this, 'IndicatorLight', {
                from: 'Setting',
                Title: GSLocalize('acid35'),
                lightSwitch: this.state.lightSwitch,
                doNotDisturbModel: this.state.doNotDisturbModel,
                startTimeMinute: this.state.startTimeMinute, // 开始分钟
                endTimeMinute: this.state.endTimeMinute // 结束分钟
              });
              // this.props.navigation.navigate('ScenePage', { title: PluginStrings.selfDefineScene });
            }}
          />
          {/* <Separator style={{ height: 2,marginLeft: 27,marginRight: 27 }} /> */}
          <View
            style={{
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              paddingLeft: 27,
              paddingRight: 27
            }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: '#E5E5E5',
                width: '100%',
                flexDirection: 'row'
              }}
            ></View>
          </View>

          <CommonSetting
            navigation={this.props.navigation}
            firstOptions={this.commonSettingParams.firstOptions}
            secondOptions={this.commonSettingParams.secondOptions}
            extraOptions={this.commonSettingParams.extraOptions}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SdkStyles.common.backgroundColor,
    flex: 1
  }
});
