/*
 * @Author: huayou.fu 
 * @Created date: 2022-02-16 09:55:54 
 */

import React from "react";
import { StyleSheet, View, Image, Text, TextInput, SectionList, TouchableOpacity } from "react-native";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { GSImage } from "../../constants/image/image";
import { navigatePushPage, navigateReset } from "../../navigate";
import { MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";

export default class GSMatchCodeSuccessPage extends SafeAreaBaseContainer {

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
        this.onComplete();
      }
    });
        
  }

    onComplete = () => {
      let from:String = this.props.navigation.state.params.from;
      console.log('========== from', from);
      if (!!from && from.toLowerCase().indexOf('setting') != -1) {
        navigatePushPage(this, 'Setting');
      } else {
        // navigatePushPage(this, 'Home');
        navigateReset(this, 'Home');
      }
    }

    gsRender() {
      let from:String = this.props.navigation.state.params.from;
      let marginBottom = 12;
      if (!!from && from.toLowerCase().indexOf('setting') != -1) {
        let marginBottom = 32;
      }
      return <View style = {styles.base}>
        <Image style = {{ width: 92, height: 60 }} source={GSImage.MatchCodeSuccess}/>
        <Text style={styles.controlText}>{GSLocalize("acid114")}</Text>
        <View style={{ ...styles.confirmBtn, marginBottom: marginBottom }}>
          <TouchableOpacity onPress={() => {
            this.onComplete();
          }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: MainScreen.width - 56, height: 44 }}>
            <Text style={styles.confirmText}>{GSLocalize("acid115")}</Text>
          </TouchableOpacity>
        </View>
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
  },

  confirmBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#57B3E7',
    marginLeft: 28,
    width: MainScreen.width - 56,
    position: 'absolute',
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },

  confirmText: {
    color: '#ffffff',
    fontWeight: GSFont.Semibold,
    fontSize: 16
  }
});