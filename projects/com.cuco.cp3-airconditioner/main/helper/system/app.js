/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-06 16:41:00 
 */

import { Platform, StatusBar } from "react-native";


export const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;