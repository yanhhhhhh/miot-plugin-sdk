/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-30 14:49:33 
 */
import React, { PureComponent } from "react";
import { ScrollView, View, Text } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { IWindow } from "../tools/constant";
import { GSListPicker } from "./GSListPicker";

const ItemCell = () => {
  return (<View style = {{ width: IWindow.width, height: 40, backgroundColor: 'red' }}>

  </View>);
};

export class GSListPickerPage extends PureComponent {
    headerView = () => {
      return (<View style={{ width: IWindow.width, height: 40, backgroundColor: 'gray' }}>
        <Text> {'I am header'}</Text>
      </View>);
    };

    render() {
      return <SafeAreaView style={{ flex: 1 }}>
        <View>
          <GSListPicker header={this.headerView}></GSListPicker>
        </View>
      </SafeAreaView>;
    }
}