/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-05 11:58:35 
 */

import { NavigationBar } from "mhui-rn";
import React from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-navigation";
import { GSSystem } from "../../configuration/system";
import { statusBarHeight } from "../../helper/system/app";
import { hexToRGBA, MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";

export default class SafeAreaBaseContainer extends React.PureComponent {
  constructor(props) {
    super(props); // 不可以删除，不然state无法使用
    this.topNaviMargin = statusBarHeight;
    this.state = {
      switch: false,
      scrollEnable: true,
      showLoading: false,
      needBaseScrollView: true
    };
  }

  render() {
    return this.baseRender();
  }

  baseRender() {
    const { scrollEnable, showLoading, needBaseScrollView = true } = this.state;
    return <View style={[styles.container, { backgroundColor: this.baseColor ? this.baseColor : '#ffffff' }]}>
      {/* {
        !this.naviColor && <View style={{ position: 'absolute', backgroundColor: 'yellow', height: 20, width: '100%', }} />
      } */}
      {
        !!this.backgroundView && this.backgroundView// 背景 view
      }
      {
        !!this.animateView && this.animateView// 动画
      }
      {
        !!showLoading && <ActivityIndicator size={'large'} style={{ position: 'absolute', marginLeft: (MainScreen.width - 30) / 2.0, marginTop: (MainScreen.height - 30) / 2.0, zIndex: 10000 }} />
      }
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        {
          this.naviBar
        }
        {
          needBaseScrollView ? 
            <ScrollView scrollEnabled={scrollEnable} ref={(scrollView) => this.scrollView = scrollView} style={[styles.container, { marginTop: (this.naviBar ? 0 : this.topNaviMargin), backgroundColor: 'transparent' }]} showsVerticalScrollIndicator={false} alwaysBounceVertical={false}>
              {this.gsRender()}
            </ScrollView> : 
            <View style={[styles.container, { marginTop: (this.naviBar ? 0 : this.topNaviMargin), backgroundColor: 'transparent' }]}>
              {this.gsRender()}
            </View>
        }
        
      </SafeAreaView>
      {
        !!this.toastView && this.toastView// 弹出页面
      }
    </View>;
  }

  /** 子page使用这个做渲染
     */
  gsRender() {
    return <View></View>;
  }

  baseRemoveTopNaviMargin = () => {
    this.topNaviMargin = 0;
  }

  baseSetBackgroundColor = (color) => {
    this.baseColor = color;
  }

  setNavigationBar = (naviBar) => {
    this.naviBar = naviBar;
  }

  setBackgroundView = (backgound) => {
    this.backgroundView = backgound;
  }

  setACAnimateView = (aniView) => {
    this.animateView = aniView;
  }

  // 设置是否需要底层的ScrollView
  setNeedBaseScroll= (need) => {
    this.setState({
      needBaseScrollView: need
    });
  }

  /**
   * 设置默认导航栏
   */
  setDefaultNavibar = ({ bg = "transparent", type = 'DARK', title, onback = () => { }, needRight = false, onRightPress = () => { }, titleStyle = {}, rightIcon = 'BACK', subtitle = undefined }) => {
    this.naviBar = <NavigationBar backgroundColor = {'transparent'}
      type={NavigationBar.TYPE[type]}
      left={[{
        key: NavigationBar.ICON.BACK,
        onPress: () => { onback(); }
      }]}
      right={needRight ? [
        {
          key: NavigationBar.ICON[rightIcon],
          showDot: this.state.showDot,
          onPress: () => { onRightPress(); }
        }
      ] : undefined}
      title={title}
      titleStyle={titleStyle}
      subtitle = {subtitle}
      subtitleStyle = {{ fontSize: 14, color: hexToRGBA('#ffffff', 0.8), fontweigt: GSFont.Regular }}
      onPressTitle={() => { }}
      gestureEnabled={false}
    />;
  }

  /**
   * 设置渐变背景
   * @param {*} color String, #ffffff
   */
  setDefaultGradientBackground = (color, opacity = 1.0, color1 = color, opacity1 = 0.0) => {
    let start = `${ hexToRGBA(color, opacity) }`;
    let end = `${ hexToRGBA(color1, opacity1) }`;
    this.backgroundView = <LinearGradient colors={[start, end]} style={styles.backgound} />;
  }

  /**
   * 设置默认为：主页渐变， 暗黑模式下： 背景为黑色的样式
   */
  setBlackModeBlackGradient = () => {
    let bg = { color: '#00D3BE', opacity: 1.0, color1: '#00D3BE', opacity1: 0.0 };
    if (GSSystem.isDarkMode()) { // 黑暗模式
      bg = { color: '#000000', opacity: 1.0, color1: '#000000', opacity1: 1.0 };
    }
    this.setDefaultGradientBackground(bg.color, bg.opacity, bg.color1, bg.opacity1);
  }

  /**
   * 设置默认的为白色，暗黑为黑色的样式
   */
   setDefaultWhiteBlackModeBlackGradient = () => {
     let bg = { color: '#ffffff', opacity: 1.0, color1: '#ffffff', opacity1: 1.0 };
     if (GSSystem.isDarkMode()) { // 黑暗模式
       bg = { color: '#000000', opacity: 1.0, color1: '#000000', opacity1: 1.0 };
     }
     this.setDefaultGradientBackground(bg.color, bg.opacity, bg.color1, bg.opacity1);
   }

  setToastView = (tv) => {
    this.toastView = tv;
  }

  setScrollEnable = (enable) => {
    this.setState({
      scrollEnable: enable
    });
  }

  enableLoadingActivity = (enable) => {
    this.setState({
      showLoading: enable
    });
  } 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  // 头部的背景
  backgound: {
    width: MainScreen.width,
    marginTop: 0,
    marginLeft: 0,
    height: MainScreen.height,
    position: 'absolute'
  }
});