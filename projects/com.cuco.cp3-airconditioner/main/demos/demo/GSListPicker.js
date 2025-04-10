/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-30 15:14:46 
 */
import React, { PureComponent } from "react";
import { ScrollView, View } from "react-native";
import { IWindow } from "../tools/constant";
export class GSListPicker extends React.PureComponent {
  render() {
    const { header: HeaderView } = this.props;
    return <View style = {{ width: IWindow.width, height: IWindow.height, backgroundColor: 'red' }}>
      <ScrollView>
        {
          !!HeaderView && <HeaderView />
        }
      </ScrollView>
    </View>;
  }
}