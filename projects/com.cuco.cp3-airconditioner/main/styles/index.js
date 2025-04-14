/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-04 14:16:19 
 * 文件夹下主要放一些自定义的样式等
 */
export { IconStyles } from './IconStyles';
import { Dimensions } from "react-native";
/**
 * window 相关
 */
const designWidth = 375.0;
const designHeight = 812.0;
export const MainScreen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  centerY: (height) => {
    return (MainScreen.height - height) / 2.00;
  },
  centerX: (width) => {
    return (MainScreen.width - width) / 2.00;
  }
};

// 屏幕设计比例
export const scale = Math.min(MainScreen.width / designWidth, MainScreen.height / designHeight);

// 函数：设置margin或者padding
function assignValueToDirection(top, right = top, bottom = top, left = right, property) {
  const styles = {};
  styles[`${ property }Top`] = top;
  styles[`${ property }Right`] = right;
  styles[`${ property }Bottom`] = bottom;
  styles[`${ property }Left`] = left;
  return styles;
}

// 等比例工具
export const mixin = {
  margin: (top, right, bottom, left) => assignValueToDirection(top, right, bottom, left, 'margin'),
  padding: (top, right, bottom, left) => assignValueToDirection(top, right, bottom, left, 'padding'),
  fontSize: (size) => size * scale,
  zoom: (size) => size * scale
};


/**
 * 将hex格式color值转换为rgba.主要为了修改透明度
 * @param color
 * @param opacity
 * @returns {string}
 */
export const hexToRGBA = (color, opacity = 1) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${ r }, ${ g }, ${ b }, ${ opacity })`;
};

export const GSColors = {
  mainColor: '#57B3E7'
};

export const normalContentWidth = MainScreen.width - 24;