
// 暂时只支持 年，月
import { StringSpinner } from "mhui-rn";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GSNoopFun } from "../../constants/constant";
import { GSLocalize } from "../../manager/LanguageManager/LanguageManager";
import { MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";
const screenBackgroundColor = 'rgba(0,0,0,0.4)';
export default class GSDatePicker extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      months: months,
      years: this.getYears(),
      yearValue: props.yearValue != undefined ? props.yearValue : this.getCurrentYear(),
      monthValue: props.yearValue != undefined ? props.monthValue : this.getCurrentMonth(),
      showYear: props.yearValue != undefined ? props.yearValue : this.getCurrentYear(),
      showMonth: props.yearValue != undefined ? props.monthValue : this.getCurrentMonth()
    };
  }

    getYears = () => {
      let date = new Date();
      let year = parseInt(date.getFullYear());
      let years = [];
      for (let index = 9; index >= 0; index--) {
        years.push(`${ year - index }`);
      }
      return years;
    }

    getCurrentYear = () => {
      let date = new Date();
      return `${ date.getFullYear() }`;
    }

    getCurrentMonth = () => {
      let date = new Date();
      let month = parseInt(date.getMonth()) + 1;
      return month < 10 ? `0${ month }` : `${ month }`;
    }

    static defaultProps = {
      onDismiss: GSNoopFun,
      onCancel: GSNoopFun,
      onConfirm: GSNoopFun
    };

    render() {
      const { months, years, yearValue, monthValue, showYear, showMonth } = this.state;
      return <View style={styles.container}>
        <View style = {styles.contentContainer}>
          <View style = {styles.titleContainer}>
            <Text style = {{ fontSize: 16, fontWeight: GSFont.Semibold, color: '#333333', lineHeight: 22 }}>{GSLocalize("acid137")}</Text>
            <Text style = {{ fontSize: 14, fontWeight: GSFont.Regular, color: '#666666', lineHeight: 20 }}>{`${ yearValue }-${ monthValue }`}</Text>
          </View>
          <View style={styles.pickerContainer}>
            <StringSpinner
              style={{ width: 125, height: '100%', marginRight: 61 }}
              dataSource={years}
              defaultValue={showYear}
              pickerInnerStyle={{ lineColor: "transparent", textColor: "#999999", selectTextColor: "#57B3E7", fontSize: 16, selectFontSize: 18, rowHeight: 70, selectBgColor: "#transparent" }}
              onValueChanged={(data) => {
                this.setState({
                  yearValue: data.newValue
                });
              }}
            />
            <Text style = {{ ...styles.unitText }}>{GSLocalize('acid60')}</Text>
            <StringSpinner
              style={{ width: 125, height: '100%' }}
              dataSource={months}
              defaultValue={showMonth}
              pickerInnerStyle={{ lineColor: "transparent", textColor: "#999999", selectTextColor: "#57B3E7", fontSize: 16, selectFontSize: 18, rowHeight: 70, selectBgColor: "#transparent" }}
              onValueChanged={(data) => {
                this.setState({
                  monthValue: data.newValue
                });
              }}
            />
            <Text style = {{ ...styles.unitText, left: MainScreen.width / 2.0 + 105 }}>{GSLocalize('acid59')}</Text>
          </View>
          <View style = {styles.confirmContainer}>
            <TouchableOpacity style = {{ ...styles.button, backgroundColor: '#F5F5F5' }} onPress={
              () => {
                if (this.props.onCancel) {
                  this.props.onCancel();
                }
              }
            }>
              <Text style = {{ ...styles.text, color: '#333333' }}>{GSLocalize('acid54')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {{ ...styles.button, backgroundColor: '#57B3E7' }} onPress={() => {
              if (this.props.onConfirm) {
                this.props.onConfirm({ yearValue, monthValue });
              }
            }}>
              <Text style = {{ ...styles.text, color: '#ffffff' }}>{GSLocalize('acid51')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style = {styles.dismissPart} onPress={() => {
          if (this.props.onDismiss) {
            this.props.onDismiss();
          }
        }}/>
      </View>;
    }
    
}


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    backgroundColor: screenBackgroundColor,
    width: '100%',
    height: '100%',
    flexDirection: 'column-reverse'
  },

  contentContainer: {
    width: '100%',
    height: 394,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },

  titleContainer: {
    height: 86,
    justifyContent: 'center',
    alignItems: 'center'
  },

  pickerContainer: {
    width: '100%',
    height: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center' 
  },

  confirmContainer: {
    width: '100%',
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  button: {
    width: 153,
    height: 44,
    marginRight: 12,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },

  unitText: {
    position: 'absolute',
    color: '#57B3E7',
    fontSize: 10,
    fontWeight: GSFont.Regular,
    lineHeight: 14,
    top: 95,
    left: MainScreen.width / 2.0 - 70
  },

  text: {
    fontWeight: GSFont.Semibold,
    fontSize: 14,
    lineHeight: 20
  },

  dismissPart: {
    flex: 1
  }
});


const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
// const years = 