

import { Device, Host } from "miot";
import Service from "miot/Service";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Alert, Text } from "react-native";
import { CucoDevice, IWindow } from "../tools/constant";
import { GSDevWarn } from "../tools/GSLog";
import { GSDeviceManager } from "../DeviceManager/GSDeviceManager";
import { GSIRAirconditionerMgr } from "../DeviceManager/GSIRAirconditionerMgr";
export default class iMain extends React.PureComponent {
  constructor(props) {
    super(props);
    this.tempValue = 16;
    this.state = {
      switch: false // 总开关
    };
  }
  alertKongtiao() {
    console.log(Device.deviceID);
    Host.ui.addOrCopyIR(Device.deviceID, 0, ["miir.aircondition.ir01"], {});
  }
  render() {
    const { switch: iSwitch } = this.state;
    return <View style = {{ backgroundColor: '#ffffff', width: IWindow.width, height: IWindow.height }}>
      <TouchableOpacity style ={[styles.cellStyle]} onPress = {
        () => {
          GSIRAirconditionerMgr.setController();
        }
      }>
        <Text>{'设置空调配码'}</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style ={[styles.cellStyle]} onPress = { */}
      {/*     ()=>{ */}
      {/*        GSIRAirconditionerMgr.addController('AC遥控器', 5).then(res=>{ */}
      {/*            const {model, did} = res.result; */}
      {/*            this.model = model; */}
      {/*            this.did = did; */}
      {/*            GSDevWarn(res); */}
      {/*        }).catch(err=>{ */}
      {/*            GSDevWarn(err); */}
      {/*        }); */}
      {/*     }  */}
      {/* }> */}
      {/*    <Text>{'添加遥控器'}</Text> */}
      {/* </TouchableOpacity> */}



      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.controllersList().then((res) => {
            let controllers = res.result.controllers;
            if (controllers.length > 0) {
              this.did = controllers[0].did;
            }
            console.log("all controller start:--------------");
            GSDevWarn(res);
            console.log("all controller end:##################");
          }).catch((err) => {
            GSDevWarn(err);
          });
        }  
      }>
        <Text>{'获取所有控制器'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.controllerInfo(this.did).then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }>
        <Text>{'获取遥控器信息'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10, backgroundColor: '#ff0000' }]} onPress = {
        () => {
          GSIRAirconditionerMgr.deleteAllControllers().then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }  
      }>
        <Text>{'删除所有控制器'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.getControllerKeys(this.did).then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }  
      }>
        <Text>{'获取所有按键'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.getIrCodeInfo(this.did).then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }>
        <Text>{'获取控制器ID'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.getAllKey().then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }>
        <Text>{'获取所有遥控器key'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.getFunction().then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }>
        <Text>{'获取空调相关信息组装红外码'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style ={[styles.cellStyle, { marginTop: 10 }]} onPress = {
        () => {
          GSIRAirconditionerMgr.setTemp().then((res) => {
            GSDevWarn(res);
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }>
        <Text>{'设置温度'}</Text>
      </TouchableOpacity>
      <View style={[{ marginLeft: 60, marginTop: 10, flexDirection: 'row', height: 70 }]}>
        <TouchableOpacity onPress = {
          () => {
                            
          }
        } style={{ marginTop: 10, width: 150, height: 50, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#0000ff' }}>
          <Text>{'TEMP-'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress = {
          () => {
                        
          }
        } style={{ marginLeft: 10, marginTop: 10, width: 150, height: 50, backgroundColor: '#00ff00', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#0000ff' }}>
          <Text>{'TEMP+'}</Text>
        </TouchableOpacity>
      </View>

      {/** 总开关 */}
      <TouchableOpacity style ={[styles.centerButton, {
        backgroundColor: iSwitch ? 'green' : 'red'
      }]} onPress = {
        () => {
          GSIRAirconditionerMgr.setPowerOn(this.did, !iSwitch).then((res) => {
            GSDevWarn(res);
            this.setState({
              switch: !iSwitch
            });
          }).catch((err) => {
            GSDevWarn(err);
          });
        }
      }>
        <Text style = {styles.centerBtnText}>{this.state.switch ? 'OK' : 'NO'}</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style ={[styles.centerButton, { */}
      {/*    position:'relative', */}
      {/*    marginTop: 20, */}
      {/*    marginLeft: IWindow.centerXOf(200), */}
      {/*    width: 200, */}
      {/*    height: 50, */}
      {/*    borderRadius: 10, */}
      {/*    backgroundColor: '#000000' */}
      {/* }]} onPress = { */}
      {/*    ()=>{ */}
      {/*        this.props.navigation.navigate('SecondPage'); */}
      {/*        // Alert.alert(JSON.stringify(this.props)); */}
      {/*    } */}
      {/* }> */}
      {/*    <Text style = {[styles.centerBtnText, {fontSize: 16}]}>{'Go to next'}</Text> */}
      {/* </TouchableOpacity> */}
      {/* <TouchableOpacity style ={[styles.centerButton, { */}
      {/*    position:'relative', */}
      {/*    marginTop: 20, */}
      {/*    marginLeft: IWindow.centerXOf(200), */}
      {/*    width: 200, */}
      {/*    height: 50, */}
      {/*    borderRadius: 10, */}
      {/*    backgroundColor: '#000000' */}
      {/* }]} onPress = { */}
      {/*    ()=>{ */}
      {/*        this.props.navigation.navigate('GSBrandsPicker'); */}
      {/*    } */}
      {/* }> */}
      {/*    <Text style = {[styles.centerBtnText, {fontSize: 16}]}>{'-> Brand picker'}</Text> */}
      {/* </TouchableOpacity> */}

      {/* <TouchableOpacity style ={[styles.centerButton, { */}
      {/*    position:'relative', */}
      {/*    marginTop: 20, */}
      {/*    marginLeft: IWindow.centerXOf(200), */}
      {/*    width: 200, */}
      {/*    height: 50, */}
      {/*    borderRadius: 10, */}
      {/*    backgroundColor: '#000000' */}
      {/* }]} onPress = { */}
      {/*    ()=>{ */}
      {/*        this.props.navigation.navigate('GSListPicker'); */}
      {/*    } */}
      {/* }> */}
      {/*    <Text style = {[styles.centerBtnText, {fontSize: 16}]}>{'-> I custom picker'}</Text> */}
      {/* </TouchableOpacity> */}
    </View>;
  }
}


const cY = IWindow.centerYOf(150.0);
const cX = IWindow.centerXOf(150.0);
const styles = StyleSheet.create({
  centerButton: {
    position: 'absolute',
    backgroundColor: 'red',
    marginLeft: cX,
    marginTop: IWindow.height - 200,
    width: 150.0,
    height: 150.0,
    borderRadius: 75.0,
    justifyContent: 'center'
  },

  centerBtnText: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white'
  },

  cellStyle: {
    marginTop: 100,
    marginLeft: IWindow.centerXOf(150),
    width: 150,
    height: 40,
    backgroundColor: '#bbd1f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  }
});