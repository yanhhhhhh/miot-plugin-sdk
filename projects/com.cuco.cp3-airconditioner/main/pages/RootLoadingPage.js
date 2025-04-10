/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-18 16:57:50 
 * des: 这个页面是用来加载做一些初始化的界面 和 决定跳转到哪一个页面的
 */

import React from "react";
import { View } from "react-native";
import { GSNoop, isNoop } from "../constants/constant";
import { ACStateCenter } from "../manager/DeviceManager/GSACStateCenter";
import { GSIRAirconditionerMgr } from "../manager/DeviceManager/GSIRAirconditionerMgr";
import { GSDeivce } from "../models/device";
import { navigatePushPage, navigateReset } from "../navigate";
import { MainScreen } from "../styles";
import { HomePagePannelControl } from "./home/HomePagePannelControl";

export default class RootLoadingPage extends React.PureComponent {
  async componentDidMount() {
    try {
      let root = 'Home';
      // 1. 获取本地缓存
      let info = await ACStateCenter.isHadConfigControllId();
      GSIRAirconditionerMgr.onControlIdChange = HomePagePannelControl.onControlIdChange;
      if (!info) {
        // 2.本地不存在，则向spec服务器拉取
        info = await GSIRAirconditionerMgr.getControllerIdAndBrandIdFromServer();
        if (isNoop(info)) {
          root = 'SetControllID';
        }
      } else { // 3.本地存在，也需要异步，刷新控制器
        await GSDeivce.updateControllIdAndBrandIdFromLocal();
        GSIRAirconditionerMgr.getControllerIdAndBrandIdFromServer();
      }
      // 加一个稍微延迟，解决ios 右滑动直接退出插件的问题
      setTimeout(() => {
        navigateReset(this, root); // 重置根路由
      }, 10);
    } catch (error) {
      console.log('======== isHaveIrContoller: ', error);
    }
  }
  render() {
    return <View style = {{ width: MainScreen.width, height: MainScreen.height, backgroundColor: 'white' }}/>;
  }
}