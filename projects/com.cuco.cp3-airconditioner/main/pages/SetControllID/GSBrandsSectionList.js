/*
 * @Author: huayou.fu 
 * @Created date: 2022-02-12 10:36:16 
 */

import React from "react";
import { StyleSheet, TextInput, View, Image, SectionList, Text, TouchableOpacity } from "react-native";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
import { GSLocalize, isCurrentChinese, isCurrentEnglish } from "../../manager/LanguageManager/LanguageManager";
import { navigatePopPage, navigatePushPage } from "../../navigate";
import { MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout';
import { GSImage } from "../../constants/image/image";
const pinyin = require('pinyin');
export default class GSBrandsSectionListPage extends SafeAreaBaseContainer {
  constructor(props) {
    super(props);
    this.state = {
      brandSections: [],
      sectionIndex: 0
    };

    this.getItemLayout = sectionListGetItemLayout({
      getItemHeight: (rowData, sectionIndex, rowIndex) => sectionItemHeight,
      getSeparatorHeight: () => 0, // PixelRatio.get(), // The height of your separators
      getSectionHeaderHeight: () => sectionHeaderHeight, // The height of your section headers
      getSectionFooterHeight: () => 0 // The height of your section footers
    });
  }

  componentDidMount() {
    this.setNeedBaseScroll(false);
    this.baseSetBackgroundColor('0xffffff');
    // 设置导航栏
    this.setDefaultNavibar({
      bg: 'yellow',
      type: 'LIGHT',
      title: GSLocalize("acid121"),
      titleStyle: {
        color: '#000000',
        fontSize: 18,
        fontWeight: GSFont.Semibold
      },
      onback: () => {
        navigatePopPage(this);
      }
    });

    // 请求数据
    /** * let sections = [
            { key: "A", data: [{ name: "XXXX" ... }, { name: "YYYYY" }, { name: "XXXXZ" }, { name: "ZZZZZZZZ" }] },
            { key: "B", data: [{ name: "XXXX" ... }, { name: "YYYYY" }, { name: "XXXXZ" }, { name: "ZZZZZZZZ" }] },
            { key: "C", data: [{ name: "XXXX" ... }, { name: "YYYYY" }, { name: "XXXXZ" }, { name: "ZZZZZZZZ" }] }]
         */
    GSIRAirconditionerMgr.iracBrands().then((res) => {
      if (res.code == 0) {
        let brands = res.result.brands;
        let brandSections = [];
        brands.map((val) => {
          let pinyin = isCurrentChinese() ? `${ val.pinyin }` : `${ val.en_name }`;
          let first = pinyin.substring(0, 1).toUpperCase();
          let tSection = undefined;
          brandSections.map((sec) => {
            if (sec.key === first) {
              tSection = sec;
            }
          });
          if (tSection) {
            tSection.data.push(val);
          } else {
            brandSections.push({ key: first, data: [val] });
          }
        });
        let sortKeys = brandSections.map((res) => res.key);
        sortKeys = sortKeys.sort(); // 排序
        let sortBrandSctions = [];
        sortKeys.map((key) => {
          try {
            sortBrandSctions.push(brandSections.filter((val) => val.key === key)[0]);
          } catch (error) {}
        });
        brandSections = sortBrandSctions;
        this.scrollToIndex = 0;
        this.setState({
          brandSections
        });
      }
    }).catch((error) => {
      console.log('=======iracBrands error', error);
    });
  }

    renderSectionHeader = (info) => {
      let section = info.section.key;
      return (
        <View style = {styles.sectionHeaderContainer}>
          <Text style={styles.sectionStyle}>{section}</Text>
          <View style={{ position: 'absolute', width: MainScreen.width - 40, marginLeft: 20, height: 1, backgroundColor: '#9A9A9A', bottom: 0 }} />
        </View>
      );
    };

    renderItem = (info) => {
      let item = isCurrentChinese() ? info.item.name : info.item.en_name;
      return (
        <TouchableOpacity style = {styles.itemContainer} onPress={
          () => {
            if (info.item) {
              this.onGotoMatchPage(info.item);
            }
          }
        }>
          <Text style={styles.itemStyle}>{item}</Text>
          <View style={{ position: 'absolute', width: MainScreen.width - 40, marginLeft: 20, height: 1, backgroundColor: '#bebebe', bottom: 0 }} />
        </TouchableOpacity>
      );
    };

    onGotoMatchPage = (item) => {
      // item:  {"en_name": "Gree", "id": 97, "name": "格力", "pinyin": "ge li"}
      if (!item.id) {
        return;
      }
      this.enableLoadingActivity(true);
      GSIRAirconditionerMgr.iracMatchCodeInfo(item.id).then((res) => {
        this.enableLoadingActivity(false);
        if (!!res.nodes && res.nodes.length > 0) {
          navigatePushPage(this, 'GSMatchCode', { brandInfo: item, matchNodes: res.nodes, from: this.props.navigation.state.params.from });
        }   
      }).catch((err) => {
        this.enableLoadingActivity(false);
      });
    }

    onPress = (index) => {
      let sl: SectionList = this.sectionList;
      this.scrollToIndex = index;
      !!sl && sl.scrollToLocation({
        animated: true,
        itemIndex: 0,
        sectionIndex: index
      });
    }

    // calculateScrollToWhichSection  = (y) => {
    //     console.log('============ calculateScrollToWhichSection: ', y);
    //     const {brandSections} = this.state;
    //     if(!brandSections || brandSections.length == 0){
    //         return;
    //     }
    //     let temHeight = 0;
    //     let sectionIndex = -1;
    //     brandSections.map((section, index) => {
    //         let values: Array = section.data;
    //         if(values.length > 0){
    //             let sH =  (index + 1) * sectionHeaderHeight + values.length * sectionItemHeight; //
    //             temHeight = temHeight + sH;
    //             //console.log('============ calculate sH: ', {index, len:values.length, sH, temHeight});
    //             if(temHeight > y && sectionIndex == -1){
    //                 sectionIndex = index;
    //             }
    //         }
    //     });
    //     if(sectionIndex == -1){
    //         sectionIndex = 0;
    //     }
    //     console.log('============ section index calculate: ', sectionIndex);
    //     this.setState({
    //         sectionIndex
    //     });
    // }

    gsRender() {
      let { brandSections, sectionIndex } = this.state;
      let keys = brandSections.map((val) => { return val.key; });
      return <View style = {styles.baseContainer}>

        {/* 搜索品牌 */}
        <View style = {styles.searchContainer}>
          <TouchableOpacity onPress={() => {
            navigatePushPage(this, 'GSSectionListSearch', { brandSections, from: this.props.navigation.state.params.from });
          }} style = {{ width: MainScreen.width - 20, height: 40, backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Image style = {{ marginLeft: 10, width: 22, height: 22 }} source={GSImage.search}/>
            <Text style ={{ marginLeft: 10, color: '#999999' }}>{ GSLocalize("acid122") }</Text>
          </TouchableOpacity>
        </View>

        {/* 品牌列表 */}
        <View style = {{ backgroundColor: 'white' }}>
          {
            brandSections.length > 0 && <SectionList
              ref={(ref) => (this.sectionList = ref)}
              renderSectionHeader={this.renderSectionHeader}
              renderItem={this.renderItem}
              sections={brandSections}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => { }}
              getItemLayout={this.getItemLayout}
              style={{ marginBottom: 50, backgroundColor: '#f5f5f5' }}
              // onMomentumScrollEnd={
              //     event =>{
              //         this.calculateScrollToWhichSection(event.nativeEvent.contentOffset.y);
              //     }
              // }
              // onScrollEndDrag={
              //     event =>{
              //         this.calculateScrollToWhichSection(event.nativeEvent.contentOffset.y);
              //         // console.log('=======onScrollEndDrag event ', event.nativeEvent.contentOffset.y);
              //     }
              // }
              // ListHeaderComponent={() => <View style={{ backgroundColor: '#25B960', alignItems: 'center', height: 30 }}><Text style={{ fontSize: 18, color: '#ffffff' }}>通讯录</Text></View>}
              // ListFooterComponent={() => <View style={{ backgroundColor: '#e0e0e0', alignItems: 'center', height: 50 }} />}
            />
          }
        </View>
        {
          keys.length > 0 && <View style = {{ position: 'absolute', width: 20, height: '100%', marginLeft: MainScreen.width - 20, alignItems: 'center', justifyContent: 'center' }}>
            {
              keys.map((val, index) => <TouchableOpacity key={val} style = {{ width: '100%', height: 18 }} onPress={() => {
                this.onPress(index);
              }}>
                <Text style = {{ lineHeight: 20, textAlign: 'center', fontSize: 13, fontWeight: GSFont.Semibold, color: '#3C3C3C' }}>{val}</Text>
              </TouchableOpacity>)
            }
          </View>
        }
      </View>;
    }
}

const sectionHeaderHeight = 70;
const sectionItemHeight = 60;
const styles = StyleSheet.create({
  baseContainer: {
    width: MainScreen.width,
    // height: MainScreen.height,
    flex: 1,
    backgroundColor: '#e8e8e8'
  },

  searchContainer: {
    height: 60, 
    width: MainScreen.width,
    justifyContent: 'center',
    alignItems: 'center'
  },

  itemContainer: {
    height: sectionItemHeight,
    justifyContent: 'center',
    backgroundColor: "#ffffff"
  },
    
  itemStyle: {
    height: sectionItemHeight,
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: "#ffffff",
    color: '#3C3C3C',
    fontSize: 15,
    lineHeight: sectionItemHeight,
    marginLeft: 20
  },

  sectionHeaderContainer: {
    height: sectionHeaderHeight,
    backgroundColor: '#f5f5f5'
  },

  sectionStyle: {
    height: sectionHeaderHeight,
    lineHeight: sectionHeaderHeight,
    textAlign: 'left',
    textAlignVertical: 'center',
    color: '#00D3BE',
    fontSize: 16,
    fontWeight: GSFont.Semibold,
    marginLeft: 20,
    width: MainScreen.width - 40,
    marginTop: 10
  }
});