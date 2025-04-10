

import { Service } from "miot";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Alert, Text } from "react-native";
import { GSIRAirconditionerMgr } from "../DeviceManager/GSIRAirconditionerMgr";
import { GSIRDeviceManager } from "../DeviceManager/GSIRDeviceManager";
import { IWindow } from "../tools/constant";
import { GSDevWarn } from "../tools/GSLog";

export default class iSecondPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      switch: false
    };
  }

  render() {
    const { switch: iSwitch } = this.state;
    return <View style = {{ backgroundColor: '#ffffff', width: IWindow.width, height: IWindow.height }}>
      <TouchableOpacity style ={[styles.centerButton, {
        backgroundColor: iSwitch ? 'green' : 'red'
      }]} onPress = {
        () => {
          // this.setState({
          //     switch: !iSwitch,
          // });
          // GSIRDeviceManager.irXMAllControlerKeys().then(res => {
          //     GSDevWarn({ success: "SUCCESS", res: res });
          // }).catch(err => {
          //     GSDevWarn(err);
          // });


          // Service.ircontroller.getBrands({category: 5}).then(res=>{
          //     console.log('========Categories:', JSON.stringify(res));
          // }).catch(err=>{
          //     console.log('========Categories err:', JSON.stringify(err));
          // });

          // Service.ircontroller.getIrCodeBrand({brand_id: 97}).then(res=>{
          //     console.log('========Categories:', JSON.stringify(res));
          // }).catch(err=>{
          //     console.log('========Categories err:', JSON.stringify(err));
          // });

          GSIRAirconditionerMgr.iracControllers(182).then((res) => {
            let nodes:Array = res.nodes;
            let controller_ids = [];
            nodes.forEach((element) => {
              if (!!element.controller_id && controller_ids.indexOf(element.controller_id) == -1) {
                controller_ids.push(element.controller_id);
              }
            });
            console.log('======== controller_ids: ', controller_ids);

          }).catch((err) => {
            console.log('======== controller_ids err:', err);
          });
        }
      }>
        <Text style = {styles.centerBtnText}>{'Second'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.centerButton, {
        marginTop: 20,
        marginLeft: IWindow.centerXOf(200),
        width: 200,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#000000'
      }]} onPress = {
        () => {
          this.props.navigation.goBack();
        }
      }>
        <Text style = {[styles.centerBtnText, { fontSize: 16 }]}>{'< Go back'}</Text>
      </TouchableOpacity>
    </View>;
  }
}


const cY = IWindow.centerYOf(150.0);
const cX = IWindow.centerXOf(150.0);

const styles = StyleSheet.create({
  centerButton: {
    backgroundColor: 'red',
    marginLeft: cX,
    marginTop: cY,
    width: 150.0,
    height: 150.0,
    borderRadius: 75.0,
    justifyContent: 'center'
  },

  centerBtnText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white'
  }
});