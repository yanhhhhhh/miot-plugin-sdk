'use strict';

import { Package } from "miot";
import TitleBar from 'miot/ui/TitleBar';
import React from "react";
import { Image, Platform, StyleSheet, Text, TextInput, View } from "react-native";
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
let rValue = 0;
let gValue = 0;
let bValue = 0;
export default class SceneMain extends React.Component {
  constructor(props, context) {
    super(props, context);
    console.log(Package.entryInfo);
    this.state = {
      requestStatus: false
    };
  }

  componentDidMount() {
  }

  test() {
    alert("test");
  }

  render() {
    return (
      <View style={styles.containerAll} >
        <TitleBar type="dark"
          onPressLeft={() => Package.exit()}
          // disabled={!this.state.textValid || !this.state.numValid}
          disabled={!this.state.numValid}
          // title={'title'}
          rightText={'确定'}
          onPressRight={() => {
            let color = rValue << 16 | gValue << 8 | bValue;
            let action = Package.entryInfo;
            // action.payload.value = 'M0_T26_S0';
            Package.entryInfo.payload.value = {
              sub_props: {
                attr: [{
                  key: "prop.cuco.acpartner.cp2pro.12.3", 
                  value: 'M0_T26_S0' // 这是我们要的自定义的值
                }],
                express: 0
              }
            };
            console.log("传回native的参数为：", JSON.stringify(Package.entryInfo));
            Package.exitInfo = action;
          }}
        />
        <View style={styles.containerIconDemo}>
          {/* // source={require("../Resources/control_home.png")}  */}
          <Image style={styles.iconDemo}/>
          <Text style={styles.iconText}>开发自定义智能场景</Text>
        </View>
        <View style={styles.containerMenu}>
          <TextInput
            style={styles.textInput}
            maxLength={3}
            placeholder="R: 0-255"
            onChangeText={(text) => {
              rValue = text;
            }}
          />
          <TextInput
            style={styles.textInput}
            maxLength={3}
            placeholder="G: 0-255"
            onChangeText={(text) => {
              gValue = text;
            }}
          />
          <TextInput
            style={styles.textInput}
            maxLength={3}
            placeholder="B: 0-255"
            onChangeText={(text) => {
              bValue = text;
            }}
          />
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  containerAll: {
    flex: 1,
    flexDirection: 'column',
    // backgroundColor: '#838383',
    backgroundColor: 'red',
    marginTop: 0
  },
  containerIconDemo: {
    flex: 1.7,
    flexDirection: 'column',
    backgroundColor: '#191919',
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  containerMenu: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    alignSelf: 'stretch'
  },
  iconDemo: {
    width: 270,
    height: 181,
    alignSelf: 'center'
  },
  iconText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 20,
    alignSelf: 'center'
  },

  textInput: {
    height: 40,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    // flex: 1,
    fontSize: 16,
    padding: 4,
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    backgroundColor: '#ffffff'
  }
});
