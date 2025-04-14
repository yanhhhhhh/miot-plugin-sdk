import React from "react";
import Service from "miot/Service";
import { TouchableOpacity, Text, View, ListView, Image, StyleSheet, Platform, Option } from 'react-native';
import NavigationBar from "miot/ui/NavigationBar";
import { Device, Host, PackageEvent } from "miot";
import { GSSpec } from "../../constants/protocol/spec";
import { GSDevWarn } from "../../helper/GSLog";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { LocalStorageMgr } from "../../manager/LocalStorageManager/LocalStorageManager";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
import { appExit, navigatePopPage, navigatePushPage, navigateReset } from "../../navigate";
import { GSImage } from "../../constants/image/image";
import { MainScreen, mixin } from "../../styles";
import { GSDeivce } from "../../models/device";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";
import { isNoop } from "../../constants/constant";
export default class SetControllIDPage extends SafeAreaBaseContainer {
  constructor(props) {
    console.log("constructor...");
    super(props);
    this.state = {
      hasController: false, // 是否添加了遥控器
      controller_id: "", // controller_id
      brand_id: "", // 品牌ID
      brand_name: "", // 品牌名称
      airSelectedPos: -1, // 空调选中的位置  -1 未选择，0，空调插在插座上，1：空调没有插在插座上
      currentSettingPage: "", // 当前设置页面路由名称
      style: "" // setting 传入的方式  设置模式：setModel ， 修改配码：Coding
    };
  }
  
  componentDidMount() {
    console.log('==========set controll id page: componentDidMount ======');
    let currentPage = "";
    let style = "";
    try {
      currentPage = this.props.navigation.state.params.from;
      style = this.props.navigation.state.params.style;
    } catch (e) {
      currentPage = "root";
    }
     
    if (currentPage == "Setting") {
      this._getModel();
    }
    console.log('==========', { "currentSettingPage": currentPage, "style": style });
    this.setState({ "currentSettingPage": currentPage, "style": style });
    // this.viewFocusListener && this.viewFocusListener.remove();
    // this.viewFocusListener = this.props.navigation.addListener('didFocus', (_) => {
    //     console.log(" ========== set control Id: didFocus ======")
    //   let currentPage = "";
    //   let style = "";
    //   try {
    //     currentPage = this.props.navigation.state.params.from;
    //     style = this.props.navigation.state.params.style;
    //   } catch (e) {
    //     currentPage = "Home";
    //   }
    //   let AirConditionerStorage = "";
    //   LocalStorageMgr.get("controllerIdAndBrand").then((res)=>{
    //     AirConditionerStorage = res
    //   }).catch((err)=>{

    //   })
    //   console.log("mmmmmm:",AirConditionerStorage)
    //   this.setState({"currentSettingPage":currentPage,"style":style})
    //   if(AirConditionerStorage && currentPage != "Setting") {
    //     console.log("Home............................")
    //     this.props.navigation.navigate("Home",{});
    //     return
    //   } else if(currentPage == "Setting"){
    //     this._getModel()
    //   }else{
    //     this._getAir();
    //   }
    // });

    // 安卓才监听，iOS不跑这里来， 安卓对码成功或者不成功，都跑这里来了。
    // if (Platform.OS === 'android') { 
    //   this.viewAppearListener = PackageEvent.packageViewWillAppear.addListener(async(_) => {
    //     console.log(" ========== set control Id: packageViewWillAppear ======");
    //     try {
    //       let info = await GSIRAirconditionerMgr.isHaveIrContoller();
    //       console.log('====set controll id page:  info: ====', info);
    //       if (isNoop(info)) { // 如果没有控制器ID，不做任何跳转
    //         return;
    //       }
    //       const { currentSettingPage } = this.state;
    //       if (currentSettingPage === 'Setting') { // 返回setting
    //         navigatePopPage(this);
    //       } else { // 跳转到Home
    //         setTimeout(() => {
    //           navigateReset(this, 'Home'); // 重置根路由
    //         }, 100);
    //       }
    //     } catch (error) {
    //       console.log('====set controll id page:  controll id not set. ====', error);
    //     }
    //   });
    // }
  }

  // componentWillUnmount() {
  //   console.log('==========set controll id page: componentWillUnmount ======');
  //   if (this.viewAppearListener) {
  //     this.viewAppearListener.remove();
  //     this.viewAppearListener = null;
  //   }
  // }

  //   _getAir() { // 判断是否有红外遥控器
  //     Service.callSmartHomeAPI("/v2/irdevice/controllers",{parent_id:Device.deviceID}).then((res)=>{
  //       let isAdd = false
  //       let irId = ""  // 遥控器ID
  //       for (let i=0;i<res.controllers.length;i++) {
  //         if(res.controllers[i].model.substring(0, 17) == "miir.aircondition") {
  //           irId = res.controllers[i].did;
  //           isAdd = true;
  //         }
  //       }
  //       if(isAdd && irId != "") {
  //         GSIRAirconditionerMgr.getIrCodeInfo(irId).then((ir_res)=>{
  //           if(ir_res["code"] == 0) {
  //             this.setState({
  //               "controller_id": ir_res.result.controller_id,
  //               "brand_id": ir_res.result.brand_id
  //             })
  //             this.getBrand(this.state.brand_id)
  //           }
  //         }).catch((ir_err)=>{
  //           console.log("ir_err:")
  //           console.log(ir_err)
  //         })
  //       }
  //     }).catch((err)=>{
  //       console.log(err)
  //     })
  //   }
  //   getBrand(brandId) { // 获取品牌
  //     GSIRAirconditionerMgr.getIrBrand(brandId).then((res)=>{
  //       if(res.code == 0) {
  //         this.setState({
  //           "brand_name": res.result.name
  //         })
  //         if(!this.state.controller_id || this.state.brand_name == "") {
  //           GSDevWarn({"err":"控制器ID 或者 品牌获取失败"})
  //           return
  //         }
  //         LocalStorageMgr.set("controllerIdAndBrand",{"controller_id": this.state.controller_id,"brand_name":this.state.brand_name})
  //         this.props.navigation.navigate("Home", {});
  //       }
  //     }).catch((err)=>{
  //       console.log("err11");
  //       console.log(err);
  //     })
  //   }

  // 设置模式，重复调用
  _setModel(isOnSocket) {
    let value = isOnSocket == 0 ? true : false;
    let param = [{ did: Device.deviceID, siid: GSSpec.siid12.is_insert_air.siid, piid: GSSpec.siid12.is_insert_air.piid, value: value }];
    return new Promise((resolve, reject) => {
      console.log("set xxxxxxxxxxxxxxxxxxxxxxxxxxxxx......................");
      LocalStorageMgr.set("airSelectedInfo", { "airSelectedPos": isOnSocket });
      Service.spec.setPropertiesValue(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  // 0 :插在插座上，1： 没有插在插座上
  setModel(isOnSocket) {
    console.log(" Device.deviceID............... ", { id: Device.deviceID, model: Device.model });
    this.setState({ "airSelectedPos": isOnSocket });
  }

  setAirSelectedPos() {
    console.log("setAirSelectedPos", this.state.airSelectedPos);
    if (this.state.airSelectedPos == -1) {
      console.log("please select model");
    } else {

      /**
       * root: 首次进入
       * Setting&Coding: 在setting中 且 更改当前配码
       * 其他: 更改当前空调的工作模式
       */
      if (this.state.currentSettingPage == "root" || (this.state.currentSettingPage == "Setting" && this.state.style == "Coding")) {
        this._setModel(this.state.airSelectedPos).then((res) => {
          // if (Platform.OS == 'android') { // 安卓
          //   Host.ui.addOrCopyIR(Device.deviceID, 0, ['miir.aircondition.ir01'], { create_device: false });
          // } else if (Platform.OS == 'ios') { // IOS 注意不能扫描跳转。 只能点击进入
          //   Host.ui.addOrCopyIR(Device.deviceID, 0, ['miir.aircondition.ir01'], { dismiss_current_plug: false });
          // }
          navigatePushPage(this, 'GSBrandsSectionList', { from: this.state.currentSettingPage });
        }).catch((err) => {
          GSDevWarn(err);
        });
      } else {
        // 仅仅是设置 选中位置  page == setting  && style == setModel
        this._setModel(this.state.airSelectedPos).then((res) => {
          navigatePopPage(this);
        }).catch((err) => {
          GSDevWarn(err);
        });
      }
    }

  }
  // 获取设置的模式
  _getModel() {
    console.log("model........................");
    let param = [{ did: Device.deviceID, siid: GSSpec.siid12.is_insert_air.siid, piid: GSSpec.siid12.is_insert_air.piid }];
    Service.spec.getPropertiesValue(param).then((res) => {
      console.log("get");
      GSDevWarn(res);
      let result0 = res[0];
      if (result0["code"] == 0) {
        let data = result0["value"];
        let value = data ? 0 : 1;
        this.setState({ "airSelectedPos": value });
      }
      // this.setState({ "airSelectedPos": 1 });
    }).catch((err) => {
      console.log("err:");
      console.log(err);
    });
  }

  jumpPage() {
    let params = this.props.navigation.state.params;
    let from = params ? params.from : undefined;
    if (!!from && from === 'Setting') { 
      navigatePopPage(this);
    } else {
      appExit();
    }
  }

  render() {
    // 设置导航栏
    this.setDefaultNavibar({
      type: 'LIGHT',
      title: GSLocalize("workModel"),
      titleStyle: {
        color: '#000000',
        fontSize: 18
      },
      onback: () => { this.jumpPage(); }
    });
    return super.render();
  }

  gsRender() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={[styles.countContainerCommon, this.state.airSelectedPos == 0 ? styles.countContainerClick : styles.countContainer]} onPress={() => { this.setModel(0); }}>
          <Image
            style={{ width: mixin.zoom(308), height: mixin.zoom(160) }}
            source={GSImage.AirInPlug}
          />
          <Text style = {[styles.wordColor, this.state.airSelectedPos == 0 ? styles.selectWordColor : styles.wordColor]}>{GSLocalize("acid31")}</Text>

          <Image
            style={styles.ImageStyle}
            source={this.state.airSelectedPos == 0 ? GSImage.IconGreen : GSImage.IconDis}
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.countContainerCommon, this.state.airSelectedPos == 1 ? styles.countContainerClick : styles.countContainer]} onPress={() => { this.setModel(1); }}>
          <Image
            style={{ width: mixin.zoom(308), height: mixin.zoom(160) }}
            source={GSImage.AirOutPlug}
          />
          <Text style = {[styles.wordColor, this.state.airSelectedPos == 1 ? styles.selectWordColor : styles.wordColor]}>{GSLocalize("acid32")}</Text>
          <Image
            style={styles.ImageStyle}
            source={this.state.airSelectedPos == 1 ? GSImage.IconGreen : GSImage.IconDis}
          />
        </TouchableOpacity>
        {
          this.state.airSelectedPos == -1 ? (
            <View style={[styles.configBtnCommon, styles.configBtnBgDisClick]}>
              <Text style={styles.configBtnWordDisClick}>{GSLocalize("acid51")}</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { this.setAirSelectedPos(); }}>
              <View style={[styles.configBtnCommon, styles.configBtnBgCanClick]}>
                <Text style={styles.configBtnWordCanClick}>{GSLocalize("acid51")}</Text>
              </View>
            </TouchableOpacity>
          )
        }
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  countContainerCommon: {
    marginTop: 12,
    height: 260,
    width: MainScreen.width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2
  },
  countContainer: {
    borderColor: '#E5E5E5'
  },
  countContainerClick: {
    borderColor: '#57B3E7'
  },
  ImageStyle: {
    marginTop: 12,
    borderRadius: 11,
    width: 22,
    height: 22
  },
  wordColor: { // 文字默认颜色
    color: '#333333',
    marginTop: 12
  },
  selectWordColor: { // 文字选中颜色
    color: '#57B3E7'
  },
  configBtnCommon: {
    width: MainScreen.width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    height: 44,

    marginTop: 32

    // paddingBottom: 11
  },
  configBtnBgDisClick: {
    backgroundColor: '#F5F5F5'
  },
  configBtnWordDisClick: {
    color: '#333333',
    fontSize: 16,
    opacity: 0.3
  },
  configBtnBgCanClick: {
    backgroundColor: '#F5F5F5'
  },
  configBtnWordCanClick: {
    color: '#333333',
    fontSize: 16
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  },

  countText: {
    color: '#FF00FF'
  }
});