/*
 * @Author: huayou.fu 
 * @Created date: 2022-02-14 17:30:36 
 */

import React from "react";
import { StyleSheet, View, Image, Text, TextInput, SectionList, TouchableOpacity } from "react-native";
import SafeAreaBaseContainer from "../../components/SafeArea/SafeAreaBaseContainer";
import { GSImage } from "../../constants/image/image";
import { GSIRAirconditionerMgr } from "../../manager/DeviceManager/GSIRAirconditionerMgr";
import { isCurrentChinese } from "../../manager/LanguageManager/LanguageManager";
import { navigatePopPage, navigatePushPage } from "../../navigate";
import { MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";

export default class GSSectionListSearchPage extends SafeAreaBaseContainer {

  constructor(props) {
    super(props);
    this.state = {
      brandSections: this.props.navigation.state.params.brandSections ? this.props.navigation.state.params.brandSections : [],
      searchResults: []
    };
  }

  componentDidMount() {
    this.setNeedBaseScroll(false);
    this.baseSetBackgroundColor('#ffffff');
    // 设置导航栏
    this.setDefaultNavibar({
      bg: 'yellow',
      type: 'LIGHT',
      title: GSLocalize("acid122"),
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

    renderItem = (info) => {
      let item = isCurrentChinese() ? info.item.name : info.item.en_name;
      console.log('========== renderItem: ', item);
      return (
        <TouchableOpacity style = {styles.itemContainer} onPress={
          () => {
            if (info.item) {
              this.onGotoMatchPage(info.item);
            }
            console.log('========== info.item: ', info.item);
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

    searchText = (txt) => {
      if (!txt) {
        return;
      }
      const { brandSections } = this.state;
      let temBrandsSection:Array = brandSections.map((val) => { return { key: val.key, data: val.data.slice() }; });
      temBrandsSection.map((val) => {
        let datas = val.data;
        let result = datas.filter((obj) => {
          let searchName = isCurrentChinese() ? obj.name : obj.en_name;
          return searchName.toUpperCase().indexOf(txt.toUpperCase()) !== -1;
        });
        val.data = result;
      });
      this.setState({
        searchResults: temBrandsSection
      });
    }

    gsRender() {
      const { searchResults } = this.state;
      let iSeatchResults = searchResults.filter((res) => res.data.length > 0);
      return <View styles={styles.base}>
        {/* 搜索品牌 */}
        <View style={styles.searchContainer}>
          <View style={{ width: MainScreen.width - 20, height: 40, backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
            <Image style = {{ marginLeft: 10, width: 22, height: 22 }} source={GSImage.search}/>
            <TextInput onEndEditing={ (e) => {
              this.searchText(this.sText);
            }
            } onChangeText={
              (txt) => {
                this.searchText(txt);
                this.sText = txt;
              }
            } autoFocus = {true} ref={(ref) => this.textInput = ref} style={{ flex: 1, marginLeft: 10, color: '#999999' }} placeholder="搜索关键字" />
          </View>
        </View>
        {/* 品牌列表 */}
        <View style = {{ backgroundColor: 'white' }}>
          {
            iSeatchResults.length > 0 && <SectionList
              ref={(ref) => (this.sectionList = ref)}
              renderItem={this.renderItem}
              sections={iSeatchResults}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => { }}
              style={{ marginBottom: 50 }}
            />
          }
        </View>

      </View>;
    }
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    width: MainScreen.width,
    // backgroundColor:'#e0e0e0',
    // height: MainScreen.height,
    backgroundColor: 'yellow'
  },

  searchContainer: {
    height: 60, 
    width: MainScreen.width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8'
  },

  itemContainer: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: "#ffffff"
  },
    
  itemStyle: {
    height: 60,
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: "#ffffff",
    color: '#3C3C3C',
    fontSize: 15,
    lineHeight: 60,
    marginLeft: 20
  }
});