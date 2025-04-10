/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-26 14:52:44 
 */

import { random } from "lodash";
import React, { PureComponent } from "react";
import { StatusBar } from "react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native";
import { View, StyleSheet, SectionList, Text } from "react-native";
import CountryCodePicker from 'react-native-country-code-picker';
import { CucoDevice, IWindow } from "../tools/constant";

const pinyin = require('pinyin');
export class GSBrandsPickerPage extends PureComponent {

  // render() {
  //     // return <View style={styles.container}>
  //     //     <View style = {{marginLeft: 20, marginRight:20, marginTop: 40}}>
  //     //         <CountryCodePicker isShow={true} onPick={(res) => { setTimeout(() => { alert(res.phoneCode) }, 1000) }} />
  //     //     </View>
  //     // </View>
  //     return <View style={styles.container}>
  //             <SectionList data = {['1', '2', '3']} sections = {['1', '2', '3']}>

  //             </SectionList>
  //     </View>
  // }

  onPress = (index) => {
    try {
      let sl: SectionList = this.sectionList;
      !!sl && sl.scrollToLocation({
        animated: true,
        itemIndex: 0,
        sectionIndex: index,
        viewPosition: 0
      });
    } catch (error) {

    }
  }

  render() {
    console.log('======== 11');
    let sections = [
      { typeName: "导演", persons: [{ name: "XXXX" }, { name: "YYYYY" }, { name: "XXXXZ" }, { name: "ZZZZZZZZ" }] },
      { typeName: "领盒饭", persons: [{ name: "XXXX" }, { name: "YYYYY" }, { name: "XXXXZ" }, { name: "ZZZZZZZZ" }] },
      { typeName: "吃瓜", persons: [{ name: "XXXX" }, { name: "YYYYY" }, { name: "XXXXZ" }, { name: "ZZZZZZZZ" }] },
      { typeName: "演员", persons: [{ name: "成龙" }, { name: "李治廷" }, { name: "成龙" }, { name: "李治廷" }, { name: "成龙" }, { name: "李治廷" }] }];

    // 这里要对数组转换一下，
    // 因为SectionList要求item必须是data的数组，
    // 如果把data写成其他单词则会报错
    // 不管你是否使用一个或多个不同的section，都要重新定义以下section如：
    // tempData.key = item.typeName;    
    // temData.key =`${item.typeName} ${item.typeNameEn}`
    //   tempData.typeName = item.typeName; tempData.key = item.typeNameEn
    let pinyins = [];
    let tempArr = sections.map((item, index) => {
      let tempData = {};
      tempData.key = item.typeName;
      tempData.data = item.persons;
      let hPinYin = (pinyin(tempData.key)[0][0][0]).toUpperCase();
      if (pinyins.indexOf(hPinYin) == -1) {
        pinyins.push(hPinYin);
      }
      return tempData;
    });
    return (
      <SafeAreaView style={{ width: IWindow.width, height: IWindow.height, backgroundColor: 'white' }}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <SectionList
            ref={(ref) => (this.sectionList = ref)}
            renderSectionHeader={this.renderSectionHeader}
            renderItem={this.renderItem}
            sections={tempArr}
            ItemSeparatorComponent={() => <View style={{ height: 1, marginLeft: 10, backgroundColor: 'gray', width: (IWindow.width - 20) }}><Text></Text></View>}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => { }}
          // ListHeaderComponent={() => <View style={{ backgroundColor: '#25B960', alignItems: 'center', height: 30 }}><Text style={{ fontSize: 18, color: '#ffffff' }}>通讯录</Text></View>}
          // ListFooterComponent={() => <View style={{ backgroundColor: '#25B960', alignItems: 'center', height: 30 }}><Text style={{ fontSize: 18, color: '#ffffff' }}>通讯录尾部</Text></View>}
          />
        </View>
        <View style={{ position: 'absolute', height: IWindow.height, marginLeft: IWindow.width - 40, width: 30, justifyContent: 'center' }}>
          {
            pinyins.map((item, index) => {
              return <TouchableOpacity key={item} onPress={
                () => {
                  this.onPress(index);
                }
              }>
                <Text style={{ width: 30, lineHeight: 40, textAlign: 'center' }}>{item}</Text>
              </TouchableOpacity>;
            })
          }
        </View>
      </SafeAreaView>
    );
  }

  renderSectionHeader = (info) => {
    let section = info.section.key;
    return (<Text style={styles.sectionStyle}>{section}</Text>
    );
  };

  renderItem = (info) => {
    let item = info.item.name;
    return (
      <Text style={styles.itemStyle}>{item}</Text>
    );
  };
}

const styles = StyleSheet.create({
  itemStyle: {
    height: 60,
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: "#ffffff",
    color: '#5C5C5C',
    fontSize: 15,
    lineHeight: 60,
    marginLeft: 10
  },
  sectionStyle: {
    height: 50,
    lineHeight: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#d8d8e8',
    color: 'white',
    fontSize: 30,
    marginLeft: 10,
    width: IWindow.width - 20
  }
});