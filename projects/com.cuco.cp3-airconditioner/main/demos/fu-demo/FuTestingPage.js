/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-04 18:40:30 
 */

import { MHDatePicker, SlideGear } from "mhui-rn";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Appearance, TextInput } from "react-native";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { appExit, navigatePopPage, navigatePushPage } from "../../navigate";
import { MainScreen } from "../../styles";
import LottieView from 'lottie-react-native';
import { GSDevWarn } from "../../helper/GSLog";
import { LocalStorageKeys, LocalStorageMgr } from "../../manager/LocalStorageManager/LocalStorageManager";
import GSDatePicker from "../../components/DatePicker/GSDatePicker";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
export default class FuTestingPage extends SafeAreaBaseContainer {
  constructor(props) {
    super(props);
    this.state = {
      showDatePicker: false
    };
  }

  componentDidMount() {

    // LocalStorageMgr.set('oook', {a: 'cccc'});

    let value = LocalStorageMgr.get('oook');
    GSDevWarn(value);
    this.animation?.play();
  }

  render() {
    const { showDatePicker } = this.state;
    this.setToastView(showDatePicker ? 
      <GSDatePicker onDismiss = {() => {
        this.setState({
          showDatePicker: false
        });
      }} onCancel = {() => {
        console.log('===========onCancel');
      }} onConfirm = {
        (val) => {
          console.log('===========', val);
        }
      }/> : undefined);

    // 插入动画
    // this.setACAnimateView(true ? <View style={{ position: 'absolute', width: MainScreen.width, height: 1000, marginTop: 80, backgroundColor: 'red', zIndex: 1000 }}>
    //   <LottieView
    //     loop={true}
    //     ref={(animation) => {
    //       this.animation = animation;
    //     }}
    //     style = {{
    //       /* 解决空报错 */
    //     }} 
    //     source={require('../../../resources/images/homeAnimate.json')}
    //   />
    // </View> : <View/>);
    return super.render();
  }

  gsRender() {
    const { showDatePicker } = this.state;
    return <View style={styles.base}>
      <TouchableOpacity onPress= {
        () => {
          // console.log('=============', showDatePicker);
          // this.setState({
          //   showDatePicker: !showDatePicker,
          // });
          GSIRAirconditionerMgr.matchCode_SendKey({ controllId: 10727, ac_key: 'power_on' });
        }
      } style ={{ marginTop: 10, width: 200, height: 50, borderRadius: 8, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'Power on'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress= {
        () => {
          GSIRAirconditionerMgr.matchCode_SendKey({ controllId: 10727, ac_key: 'power_off' });
        }
      } style ={{ marginTop: 10, width: 200, height: 50, borderRadius: 8, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'Power off'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress= {
        () => {
          this.setState({
            showDatePicker: !showDatePicker
          });
        }
      } style ={{ marginTop: 10, width: 200, height: 50, borderRadius: 8, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'显示GSPicker'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={
        () => {
          appExit();
        }
      } style ={{ marginTop: 10, width: 200, height: 50, borderRadius: 8, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'退出插件'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={
        () => {
          navigatePushPage(this, 'GSBrandsSectionList');
        }
      } style ={{ marginTop: 10, width: 200, height: 50, borderRadius: 8, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'选择商品列表'}</Text>
      </TouchableOpacity>
    </View>;
  }

}

const COLORRANGE = {
  "0.00": '#FF0000',
  "0.10": '#FF0000',
  "0.20": '#FF0000',
  "0.30": '#01FF00',
  "0.40": '#00FDA4',
  "0.50": '#FF0000',
  "0.60": '#007CFF',
  "0.70": '#0600F9',
  "0.80": '#BF00FC',
  "0.90": '#FF0081',
  "1.00": '#000000'
};


const styles = StyleSheet.create({
  base: {
    width: MainScreen.width,
    height: MainScreen.height,
    backgroundColor: 'black',
    alignItems: 'center'
  }
});