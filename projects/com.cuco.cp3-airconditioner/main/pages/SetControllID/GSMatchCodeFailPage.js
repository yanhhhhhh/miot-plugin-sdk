/*
 * @Author: huayou.fu 
 * @Created date: 2022-02-16 09:55:54 
 */

import React from "react";
import { StyleSheet, View, Image, Text, TextInput, SectionList, TouchableOpacity } from "react-native";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { GSImage } from "../../constants/image/image";
import { navigatePopPage, navigatePushPage } from "../../navigate";
import { MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";

export default class GSMatchCodeFailPage extends SafeAreaBaseContainer {
  componentDidMount() {
    this.setNeedBaseScroll(false);
    this.baseSetBackgroundColor('#ffffff');
    // 设置导航栏
    this.setDefaultNavibar({
      bg: 'yellow',
      type: 'LIGHT',
      title: GSLocalize("acid120"),
      titleStyle: {
        color: '#000000',
        fontSize: 18,
        fontWeight: GSFont.Semibold
      },
      onback: () => {
        navigatePushPage(this, 'GSBrandsSectionList');
      }
    });
  }
  gsRender() {
    return <View style = {styles.base}>
      <Image style = {{ width: 92, height: 60 }} source={GSImage.MatchCodeFail}/>
      <Text style={styles.controlText}>{GSLocalize("acid116")}</Text>
    </View>;
  }
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  controlText: {
    marginTop: 12,
    color: '#999999',
    fontWeight: GSFont.Regular,
    fontSize: 14,
    lineHeight: 20
  }
});