/*
 * @Author: huayou.fu 
 * @Created date: 2022-02-15 18:27:22 
 */

import { LoadingDialog, MessageDialog } from "mhui-rn";
import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { ACMode, WIND } from "../../constants/airconditioner";
import { isNoop } from "../../constants/constant";
import { GSImage } from "../../constants/image/image";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
import { navigatePopPage, navigatePushPage } from "../../navigate";
import { mixin } from "../../styles";
import { GSFont } from "../../styles/font";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";

export default class GSMatchCodePage extends SafeAreaBaseContainer {

  constructor(props) {
    super(props);
    console.log('========== params : ', this.props.navigation.state.params.matchNodes[0]);
    this.state = {
      brandInfo: this.props.navigation.state.params.brandInfo ? this.props.navigation.state.params.brandInfo : {},
      matchNodes: this.props.navigation.state.params.matchNodes ? this.props.navigation.state.params.matchNodes : {},
      currentNode: this.props.navigation.state.params.matchNodes[0], 
      showMessage: false,
      enableLoading: false
    };
  }

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
        navigatePopPage(this);
      }
    }); 
  }

    /**
     * {
      "id": 4,
      "key": {
        "ac_key": "power_on"
      },

      "key": { //不同的一种
        "id": 1,
        "name": "POWER",
        "display_name": "\u7535\u6e90"
      },
      "controller_id": 2607,
      "count": 35,
      "cursor": 2,
      "total": 37,
      "matched": 5,
      "mismatched": 7
    },
     */
    controlTitle = () => {
      const { currentNode } = this.state;
      const { ac_key, display_name } = currentNode.key;
      // console.log('=======', {ac_key, display_name});
      if (ac_key) {
        if (ac_key === 'power_on') {
          return GSLocalize("acid118");
        } else if (ac_key === 'power_off') {
          return GSLocalize("acid119");
        } else if (ac_key.indexOf('_')) {
          let res = '--'; // M0_T26_S0
          let commands = ac_key.split('_');
          console.log('======== commands: ', commands);
          if (commands.length > 0) {
            commands.map((val) => {
              if (val.substring(0, 1) === 'M') {
                let mode = parseInt(val.substring(1, 2));
                let modeObj = ACMode.mode(mode);
                res = `${ res + modeObj.name }/`;
              } else if (val.substring(0, 1) === 'T') {
                let temp = parseInt(val.substring(1, 3));
                res = `${ res }${ temp }°C/`;
              } else if (val.substring(0, 1) === 'S') {
                let wind = parseInt(val.substring(1, 2));
                let windObj = WIND.type(wind);
                res = `${ res + windObj.name }/`;
              }
            });
          }
          if (res === '--') {
            return res;
          }
          res = res.replace('--', '');
          res = res.substring(0, res.length - 1);
          return res;
        }
      } else if (display_name) {
        return display_name;
      } else {
        return '--';
      }
    }

    gotoNextMatchNode = (isMatch) => {
      const { currentNode, matchNodes, brandInfo } = this.state;
      const { matched, mismatched, controller_id } = currentNode;
      if (!!isMatch && (!matched || matched == null)) { // 匹配成功
        this.setState({
          showMessage: false,
          enableLoading: true
        });
        GSIRAirconditionerMgr.updateBrandIdAndControllerId(controller_id, brandInfo.id).then((res) => {
          if (res) {
            this.setState({
              enableLoading: false
            });
            navigatePushPage(this, 'GSMatchCodeSuccess', { from: this.props.navigation.state.params.from });
          } else {
            this.setState({
              enableLoading: false
            });
          }
        });
      } else if (!!isMatch && !!matched) {
        this.setState({
          currentNode: matchNodes[matched - 1],
          showMessage: false
        });
      } else if (!isMatch && (!mismatched || mismatched == null)) { // 匹配失败
        this.setState({
          showMessage: false
        });
        navigatePushPage(this, 'GSMatchCodeFail');
      } else if (!isMatch && !!mismatched) {
        this.setState({
          currentNode: matchNodes[mismatched - 1],
          showMessage: false
        });
      }
    }

    onChangeMatchNode = (next = true) => {
      const { currentNode, matchNodes } = this.state;
      let targetNode = {};
      matchNodes.map((node) => {
        if (node.cursor == (next ? (currentNode.cursor + 1) : (currentNode.cursor - 1)) && isNoop(targetNode)) {
          targetNode = node;
        }
      });
      this.setState({
        currentNode: targetNode,
        showMessage: false
      });
    }

    sendAc_key = () => {
      const { currentNode } = this.state;
      const { key, controller_id } = currentNode;
      const { ac_key, id } = key;
      if (ac_key) {
        GSIRAirconditionerMgr.matchCode_SendKey({ controllId: controller_id, ac_key: ac_key });
      } else {
        GSIRAirconditionerMgr.matchCode_SendKey({ controllId: controller_id, key_id: id });
      } 
      this.setState({
        showMessage: true
      });
    }

    gsRender() {
      const { showMessage, enableLoading, currentNode } = this.state;
      return <View style = {styles.base}>
        <Text style = {styles.text0}>{GSLocalize("acid103")}</Text>
        <Text style = {styles.text1}>{GSLocalize("acid104")}</Text>
        <View style = {styles.controlContainer}>
          <View style={{ opacity: (currentNode.cursor == 1) ? 0 : 1 }}>
            <TouchableOpacity onPress={() => {
              if (currentNode.cursor === 1) {
                return;
              }
              this.onChangeMatchNode(false);
            }}>
              <Image style={{ width: 48, height: 48 }} source={GSImage.MatchCodeLeft} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ marginLeft: 48 }} onPress={
            () => { this.sendAc_key(); }
          }>
            <Image style = {{ width: 80, height: 80 }} source={GSImage.MatchCodeControl}/>
          </TouchableOpacity>
          <View style={{ marginLeft: 48, opacity: (currentNode.cursor === currentNode.total) ? 0 : 1 }}>
            <TouchableOpacity onPress={() => {
              if (currentNode.cursor === currentNode.total) {
                return;
              }
              this.onChangeMatchNode(true);
            }}>
              <Image style={{ width: 48, height: 48 }} source={GSImage.MatchCodeRight} />
            </TouchableOpacity>
          </View>
        </View>
        {/* '制冷/26℃/自动' */}
        <Text style={styles.controlText}>{this.controlTitle()}</Text> 
        <Text style={styles.controlIdText}>{`ID: ${ currentNode.controller_id } (${ currentNode.cursor }/${ currentNode.total })`}</Text>
        {
          !!showMessage && <MessageDialog
            visible={true}
            title= {GSLocalize("acid108")}
            message={''}
            buttons={[
              {
                text: GSLocalize("acid109"),
                style: { color: 'lightpink' },
                callback: () => {
                  this.gotoNextMatchNode(false);
                }
              },
              {
                text: GSLocalize("acid110"),
                style: { color: '#57B3E7' },
                callback: () => {
                  this.gotoNextMatchNode(true);
                }
              }
            ]}
            canDismiss = {false}
          />
        }

        {
          !!enableLoading && <LoadingDialog
            visible={true}
            message={GSLocalize("acid117")}
            timeout={120000}
            cancelable = {false}
          />
        }
      </View>;
    }
}


const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  text0: {
    fontWeight: GSFont.Semibold,
    fontSize: 18,
    color: '#333333',
    lineHeight: 24,
    marginHorizontal: 40,
    textAlign: 'center'
  },

  text1: {
    marginTop: 12,
    fontWeight: GSFont.Regular,
    fontSize: 14,
    color: '#999999',
    lineHeight: 20, 
    marginHorizontal: 40,
    textAlign: 'center'
  },

  controlContainer: {
    marginTop: mixin.zoom(114),
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },

  controlText: {
    marginTop: 24,
    color: '#333333',
    fontWeight: GSFont.Semibold,
    fontSize: 20,
    lineHeight: 28
  },

  controlIdText: {
    marginTop: 8,
    color: '#999999',
    fontWeight: GSFont.Regular,
    fontSize: 16,
    lineHeight: 22
  }
});