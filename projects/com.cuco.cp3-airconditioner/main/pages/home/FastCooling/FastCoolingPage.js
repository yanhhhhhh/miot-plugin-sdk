import { ListItem, MHCard, MHDatePicker, Separator, Switch } from 'mhui-rn';
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';
import SafeAreaBaseContainer from '../../../components/SafeArea/SafeAreaBaseContainer';
import { GSImage } from '../../../constants/image/image';
import { navigatePopPage, navigatePushPage } from '../../../navigate';
import {
  GSColors,
  IconStyles,
  MainScreen,
  normalContentWidth
} from '../../../styles';
import { GSFont } from '../../../styles/font';
import { GSLocalize } from '../../../manager/LanguageManager/LanguageManager';
import { FastCoolingPageControl } from './FastCoolingPageControl';

export default class FastCoolingPage extends SafeAreaBaseContainer {
  constructor(props) {
    super(props);
    this.state = {
      switchOn: FastCoolingPageControl.switchOn,
      duration: FastCoolingPageControl.duration,
      showTimePicker: false
    };
  }

  async componentDidMount() {
    console.log('=====componentDidMount=====');
    FastCoolingPageControl.onUpdate = (val) => {
      this.setState({
        ...val
      });
      this.enableLoadingActivity(false);
    };
    let values = await FastCoolingPageControl.switchAndDuration();
    this.setState({
      ...values
    });
  }

  onSelectDuration = (res) => {
    const { rawArray } = res;
    if (!!rawArray && rawArray.length > 0) {
      let duration = parseInt(rawArray[0]);
      this.setState({
        duration,
        showTimePicker: false
      });
    }
  };

  onSwitchChange = (val) => {
    this.enableLoadingActivity(true);
    FastCoolingPageControl.setSwithOn(val);
  };

  onConfirmSet = async() => {
    this.enableLoadingActivity(true);
    const { switchOn, duration } = this.state;
    await FastCoolingPageControl.setSwithOnAndDuration(switchOn, duration);
    this.enableLoadingActivity(false);
  };

  /**
   * 为了实现 头部设置的渲染，必须实现render
   */
  render() {
    // 设置导航栏
    this.setDefaultNavibar({
      type: 'LIGHT',
      title: GSLocalize('acid4'),
      titleStyle: {
        color: '#000000',
        fontSize: 18,
        fontWeight: GSFont.Semibold
      },
      needRight: this.state.switchOn,
      rightIcon: 'COMPLETE',
      onRightPress: () => {
        this.onConfirmSet();
      },
      onback: () => {
        navigatePopPage(this);
      }
    });
    // 设置背景颜色
    this.baseSetBackgroundColor('#FFFFFF');
    this.baseRemoveTopNaviMargin();
    return super.render();
  }

  gsRender() {
    const { switchOn, showTimePicker, duration } = this.state;
    let minTemp = FastCoolingPageControl.getMinTemp();
    return (
      <View style={styles.container}>
        {/* 开关 */}
        <View style={styles.swithContainer}>
          <Text style={styles.switchTitle}>{GSLocalize('acid64')}</Text>
          <Switch
            value={switchOn}
            style={styles.switch}
            tintColor={'#E5E5E5'}
            onTintColor={'#57B3E7'}
            onValueChange={(val) => {
              this.onSwitchChange(val);
            }}
          />
        </View>
        <Text
          style={{
            lineHeight: 16,
            textAlign: 'left',
            fontWeight: GSFont.Regular,
            fontSize: 12,
            color: '#999999'
          }}
        >
          {GSLocalize('acid6')}
        </Text>
        {switchOn && (
          <View style={styles.onContainer}>
            <ListItem
              title={GSLocalize('acid5')}
              value={`${ duration }${ GSLocalize('acid94') }`}
              containerStyle={{
                width: MainScreen.width,
                height: 100,
                backgroundColor: 'white'
              }}
              titleStyle={{
                textAlign: 'left',
                fontSize: 16,
                color: '#000000',
                fontWeight: GSFont.Semibold
              }}
              valueStyle={{
                fontSize: 13,
                color: '#999999',
                textAlign: 'right',
                width: 100
              }}
              onPress={() => {
                this.setState({
                  showTimePicker: true
                });
              }}
              showSeparator={true}
              separator={<Separator style={{ marginLeft: 27, width: CW }} />}
            />
            <View
              style={{
                marginTop: 20,
                height: 60,
                width: CW,
                justifyContent: 'center'
              }}
            >
              <Text style={styles.switchTitle}>{GSLocalize('acid97')}</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={{ backgroundColor: 'white' }}>
                <Image
                  style={{ width: 321, height: 180 }}
                  source={GSImage.fastCoolingChart}
                />
                <Text
                  style={{
                    position: 'absolute',
                    ...styles.topText,
                    marginLeft: 16
                  }}
                >
                  {GSLocalize('acid98')}
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    ...styles.topText,
                    width: 321,
                    marginTop: 50,
                    textAlign: 'right'
                  }}
                >
                  {GSLocalize('acid99')}
                </Text>
                <View
                  style={{
                    position: 'absolute',
                    marginTop: 180 - 30,
                    marginLeft: (321 - 242) / 2.0,
                    width: 242,
                    height: 30,
                    justifyContent: 'space-between',
                    flexDirection: 'row'
                  }}
                >
                  <Text
                    style={{
                      ...styles.bottomText,
                      width: 50,
                      textAlign: 'center',
                      lineHeight: 32
                    }}
                  >{`${ minTemp }°C`}</Text>
                  <Text
                    style={{
                      ...styles.bottomText,
                      width: 50,
                      textAlign: 'right',
                      lineHeight: 32
                    }}
                  >{`${ minTemp }°C`}</Text>
                </View>
              </View>
              <View
                style={{
                  height: 40,
                  width: 321,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text style={styles.chartBottomText}>
                  {GSLocalize('acid132')}
                </Text>
                <Text style={styles.chartBottomText}>{`${ duration }${ GSLocalize(
                  'acid94'
                ) }`}</Text>
              </View>
            </View>
          </View>
        )}
        <MHDatePicker
          animationType="fade"
          datePickerStyle={{
            titleStyle: {
              color: '#333333',
              fontSize: 16,
              lineHeight: 22,
              fontWeight: GSFont.Semibold
            },
            leftButtonStyle: {
              color: '#333333',
              fontWeight: GSFont.Semibold,
              fontSize: 14
            },
            rightButtonStyle: {
              color: '#FFFFFF',
              fontWeight: GSFont.Semibold,
              fontSize: 14
            },
            leftButtonBgStyle: {
              bgColorNormal: '#F5F5F5'
            },
            rightButtonBgStyle: {
              bgColorNormal: '#57B3E7'
            }
          }}
          visible={showTimePicker}
          title={GSLocalize('acid5')}
          showSubtitle={false}
          confirmColor="#57b3e7"
          type={MHDatePicker.TYPE.SINGLE}
          singleType={MHDatePicker.SINGLE_TYPE.MINUTE}
          current={[`${ duration }`]}
          min={['1']}
          max={['60']}
          onSelect={(res) => {
            this.onSelectDuration(res);
          }}
          onDismiss={(_) => {
            this.setState({
              showTimePicker: false
            });
          }}
        />
      </View>
    );
  }
}

const CW = MainScreen.width - 54;
const styles = StyleSheet.create({
  container: {
    width: MainScreen.width,
    height: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 27
  },

  // 速冷
  swithContainer: {
    flexDirection: 'row',
    width: CW,
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center'
  },

  switchTitle: {
    width: CW - 44 - 21,
    color: '#000000',
    fontWeight: GSFont.Semibold,
    fontSize: 16,
    textAlign: 'left',
    marginRight: 21
  },

  switch: {
    width: 44,
    height: 24
  },

  onContainer: {
    width: CW,
    alignItems: 'center'
  },

  chartContainer: {
    height: 180,
    width: CW,
    marginTop: 12,
    alignItems: 'center'
  },

  topText: {
    height: 14,
    width: 100,
    fontWeight: GSFont.Regular,
    fontSize: 10,
    color: '#999999'
  },

  bottomText: {
    height: 30,
    width: 100,
    fontWeight: GSFont.Regular,
    fontSize: 10,
    color: '#7F7F7F'
  },

  chartBottomText: {
    fontSize: 12,
    fontWeight: GSFont.Regular,
    color: '#666666'
  }
});
