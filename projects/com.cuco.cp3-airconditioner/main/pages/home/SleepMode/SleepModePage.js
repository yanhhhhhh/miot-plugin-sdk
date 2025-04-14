/*
 * @Author: huayou.fu
 * @Created date: 2022-01-08 15:17:13
 * 周电量统计
 */
import {
  ChoiceDialog,
  ListItem,
  ListItemWithSwitch,
  MHDatePicker,
  NavigationBar,
  Separator,
} from 'mhui-rn';
import React from 'react';
import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  PanResponder,
  Animated,
  TabBarIOS,
} from 'react-native';
import SleepDuringItemCell from '../../../components/cells/SleepDuringItemCell';
import GSDialogPage from '../../../components/dialog/GSDialog';
import { GSDottedLine } from '../../../components/Line/GSDotted';
import SafeAreaBaseContainer from '../../../components/SafeArea/SafeAreaBaseContainer';
import { WIND } from '../../../constants';
import { navigatePopPage } from '../../../navigate';
import { MainScreen } from '../../../styles';
import { GSFont } from '../../../styles/font';
import { GSLocalize } from '../../../manager/LanguageManager/LanguageManager';
import { SleepModePageControl } from './SleepModePageControl';
import { HomePagePannelControl } from '../HomePagePannelControl';
import { GSImage } from '../../../constants/image/image';
import { Facebook } from 'react-content-loader';
import { isNoop } from '../../../constants/constant';
export default class SleepModePage extends SafeAreaBaseContainer {
  constructor(props) {
    super(props);
    this.state = {
      controlBarIndex: 0,
      controlBarH0: 12,
      controlBarH1: 50,
      controlBarH2: 100,
      sleepDuringPickerType: -1, // 0:重复，开始时间，结束时间,  1：重复复选, 2:自定义重复, 3:开始时间, 4：结束时间
      selectedReatItemIndex: -1, // 每天：0  ... 自定义：3
      showWindPicker: false,
      showAfterSleepPicker: false,
      showDelayClosePicker: false,
      on: SleepModePageControl.on,
      startTime: SleepModePageControl.startTime,
      endTime: SleepModePageControl.endTime,
      willStartTime: SleepModePageControl.startTime,
      willEndTime: SleepModePageControl.endTime,
      beginTemp: SleepModePageControl.beginTemp,
      middleTemp: SleepModePageControl.middleTemp,
      endTemp: SleepModePageControl.endTemp,
      repeats: SleepModePageControl.repeats,
      willRepeats: SleepModePageControl.repeats,
      swingEnable: SleepModePageControl.swingEnable,
      windValue: SleepModePageControl.windValue,
      afterSleepState: SleepModePageControl.afterSleepState,
      delayTime: SleepModePageControl.delayTime,
      showToast: false,
    };
  }

  componentDidMount() {
    const { beginTemp, middleTemp, endTemp } = this.state;
    let tempRange = SleepModePageControl.tempsRange();
    let bH = this.calcalateHeigthForTemp(tempRange, beginTemp);
    let mH = this.calcalateHeigthForTemp(tempRange, middleTemp);
    let eH = this.calcalateHeigthForTemp(tempRange, endTemp);
    this.setState({
      controlBarH0: bH,
      controlBarH1: mH,
      controlBarH2: eH,
    });

    SleepModePageControl.onUpdatePage = (val) => {
      this.enableLoadingActivity(false);
      if (isNoop(val)) {
        return;
      }
      console.log('=========Sleep update: ========', val);
      let bH = this.calcalateHeigthForTemp(tempRange, val.beginTemp);
      let mH = this.calcalateHeigthForTemp(tempRange, val.middleTemp);
      let eH = this.calcalateHeigthForTemp(tempRange, val.endTemp);
      this.setState({
        ...val,
        willStartTime: val.startTime,
        willEndTime: val.endTime,
        controlBarH0: bH,
        controlBarH1: mH,
        controlBarH2: eH,
      });
    };
    this.enableLoadingActivity(true);
    SleepModePageControl.getAllSleepStates();
  }

  calcalateHeigthForTemp = (range, val) => {
    if (!range || range.length == 0) {
      range = [16, 30];
    }
    let min = range[0];
    let max = range[range.length - 1];
    let h = ((val - min) / (max - min)) * maxTempH;
    if (h < minTempH) {
      h = minTempH;
    } else if (h > maxTempH) {
      h = maxTempH;
    }
    return h;
  };

  calculateTempForHeight = (height) => {
    let tempRange = SleepModePageControl.tempsRange();
    if (!tempRange || tempRange.length == 0) {
      tempRange = [16, 30];
    }
    let min = tempRange[0];
    let max = tempRange[tempRange.length - 1];
    let temp = parseInt(
      ((height - minTempH) / (maxTempH - minTempH)) * (max - min) + min
    );
    if (temp < min) {
      temp = min;
    } else if (temp > max) {
      temp = max;
    }
    return temp;
  };

  // 手势
  createPanResponder = (index) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderStart: (e, g) => {
        this.setBaseSrcollEnable(false);
      },
      onPanResponderGrant: (e, gestureState) => {
        this.setBaseSrcollEnable(false);
        let x0 = gestureState.x0;
        let whichOne = 0;
        if (x0 >= 27 && x0 <= CW * 0.25 + 27) {
          whichOne = 0;
        } else if (x0 > CW * 0.25 + 27 && x0 <= CW * 0.25 + 27 + 0.5 * CW) {
          whichOne = 1;
        } else if (x0 > CW * 0.75 + 27 && x0 <= 27 + CW) {
          whichOne = 2;
        }
        this.setState({
          controlBarIndex: whichOne,
        });
        this.moveY = 0;
      },

      onPanResponderMove: (e, g) => {
        let move = this.moveY + g.dy;
        let min = minTempH;
        let max = maxTempH;
        const { controlBarIndex, controlBarH0, controlBarH1, controlBarH2 } =
          this.state;
        if (controlBarIndex == 0) {
          let val = controlBarH0 - move;
          if (val < min) {
            val = min;
          } else if (val > max) {
            val = max;
          } else if (Math.abs(val - controlBarH0) < 2) {
            return;
          }
          let temp = this.calculateTempForHeight(val);
          this.setState({
            controlBarH0: val,
            beginTemp: temp,
          });
        } else if (controlBarIndex == 1) {
          let val = controlBarH1 - move;
          if (val < min) {
            val = min;
          } else if (val > max) {
            val = max;
          } else if (Math.abs(val - controlBarH1) < 2) {
            return;
          }
          let temp = this.calculateTempForHeight(val);
          this.setState({
            controlBarH1: val,
            middleTemp: temp,
          });
        } else {
          let val = controlBarH2 - move;
          if (val < min) {
            val = min;
          } else if (val > max) {
            val = max;
          } else if (Math.abs(val - controlBarH2) < 2) {
            return;
          }
          let temp = this.calculateTempForHeight(val);
          this.setState({
            controlBarH2: val,
            endTemp: temp,
          });
        }
      },

      onPanResponderRelease: (e, g) => {
        this.setBaseSrcollEnable(true);
      },

      onResponderTerminationRequest: (event) => true,

      onPanResponderTerminate: (evt, gestureState) => {
        this.setBaseSrcollEnable(true);
      },
    });
  };

  setBaseSrcollEnable = (enable) => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (enable) {
      this.timer = setInterval(() => {
        this.setScrollEnable(true);
        clearInterval(this.timer);
      }, 600);
    } else {
      this.setScrollEnable(false);
    }
  };

  componentWillUnmount() {
    // 回收计时器。避免内存溢出
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 为了实现 头部设置的渲染，必须实现render
   */
  render() {
    const {
      sleepDuringPickerType,
      showWindPicker,
      showAfterSleepPicker,
      showDelayClosePicker,
      on,
    } = this.state;
    // 设置导航栏
    this.setDefaultNavibar({
      type: 'LIGHT',
      title: GSLocalize('acid67'),
      titleStyle: {
        color: '#000000',
        fontSize: 18,
        fontWeight: GSFont.Semibold,
      },
      onback: () => {
        navigatePopPage(this);
      },
      needRight: on,
      rightIcon: 'COMPLETE',
      onRightPress: () => {
        this.enableLoadingActivity(true);
        SleepModePageControl.specSetConfigs(this.state).then((res) => {
          this.enableLoadingActivity(false);
        });
      },
    });
    // 设置背景颜色
    this.baseSetBackgroundColor('#FFFFFF');
    this.baseRemoveTopNaviMargin();

    // 设置睡眠时段
    let picketView = undefined;
    if (sleepDuringPickerType == 0) {
      picketView = this.sleepDuringChoiceView();
    } else if (sleepDuringPickerType == 1) {
      picketView = this.repeatChoiceView();
    } else if (sleepDuringPickerType == 2) {
      picketView = this.customRepeatView();
    } else if (sleepDuringPickerType == 3) {
      picketView = this.benginTimeView();
    } else if (sleepDuringPickerType == 4) {
      picketView = this.endTimeView();
    }
    // 设置风速
    if (showWindPicker) {
      picketView = this.windPickerView();
    }

    if (showAfterSleepPicker) {
      picketView = this.afterSleepView();
    }

    if (showDelayClosePicker) {
      picketView = this.delayColseTimePickerView();
    }

    this.setToastView(picketView);

    return super.render();
  }

  gsRender() {
    const {
      controlBarH0,
      controlBarH1,
      controlBarH2,
      on,
      startTime,
      endTime,
      beginTemp,
      middleTemp,
      endTemp,
      repeats,
      swingEnable,
      windValue,
      afterSleepState,
      delayTime,
      selectedReatItemIndex,
      showToast,
    } = this.state;

    // 睡眠时段的副标题
    let repeatSubTitle = SleepModePageControl.textsOfRepeat(repeats);

    // 风速
    let windSpeed = this.windSpeedTitles()[windValue];

    // 扫风,是否有扫风
    let isHadSwing = HomePagePannelControl.isHadSwingFeature();
    let startStr = SleepModePageControl.changeMintesToTimeStr(startTime);
    let endStr = SleepModePageControl.changeMintesToTimeStr(endTime);
    let startStr_30 = SleepModePageControl.changeMintesToTimeStr(
      (startTime + 30) % 1440
    );
    let endStr_30 = SleepModePageControl.changeMintesToTimeStr(
      endTime < 30 ? endTime + 1440 - 30 : endTime - 30
    );
    return (
      <View style={styles.container}>
        {/* 安睡模式 */}
        <ListItemWithSwitch
          title={GSLocalize('acid67')}
          subtitle={GSLocalize('acid71')}
          containerStyle={{
            width: MainScreen.width,
            height: 72,
            backgroundColor: 'white',
          }}
          titleStyle={{
            textAlign: 'left',
            fontSize: 16,
            color: '#000000',
            fontWeight: GSFont.Semibold,
          }}
          subtitleStyle={{
            textAlign: 'left',
            fontSize: 13,
            color: '#999999',
            fontWeight: GSFont.Regular,
          }}
          onValueChange={(val) => {
            this.enableLoadingActivity(true);
            SleepModePageControl.sepcSetOn(val).then((result) => {
              this.enableLoadingActivity(false);
              if (result) {
                HomePagePannelControl.onUpdatePannel({ sleepModeOn: val });
                this.setState({
                  on: val,
                });
              }
            });
          }}
          value={on}
          tintColor={'#E5E5E5'}
          onTintColor={'#57B3E7'}
          showSeparator={false}
        />
        {/* 睡眠时段 */}
        {!!on && (
          <ListItem
            title={GSLocalize('acid7')}
            subtitle={`${repeatSubTitle} ${startStr}-${endStr}`}
            containerStyle={{
              width: MainScreen.width,
              height: 72,
              backgroundColor: 'white',
            }}
            titleStyle={{
              textAlign: 'left',
              fontSize: 16,
              color: '#000000',
              fontWeight: GSFont.Semibold,
            }}
            subtitleStyle={{
              textAlign: 'left',
              fontSize: 13,
              color: '#999999',
              fontWeight: GSFont.Regular,
            }}
            onPress={(val) => {
              this.setState({ sleepDuringPickerType: 0 });
            }}
            showSeparator={false}
          />
        )}

        {/* 制冷/制热 */}
        {!!on && (
          <ListItem
            title={`${GSLocalize('acid22')}/${GSLocalize('acid23')}`}
            subtitle={GSLocalize('acid73')}
            containerStyle={{
              width: MainScreen.width,
              height: 72,
              backgroundColor: 'white',
            }}
            titleStyle={{
              textAlign: 'left',
              fontSize: 16,
              color: '#000000',
              fontWeight: GSFont.Semibold,
            }}
            subtitleStyle={{
              textAlign: 'left',
              fontSize: 13,
              color: '#999999',
              fontWeight: GSFont.Regular,
            }}
            hideArrow={true}
            showSeparator={false}
          />
        )}

        {/* 风速 */}
        {!!on && (
          <ListItem
            title={GSLocalize('acid15')}
            value={windSpeed}
            containerStyle={{
              width: MainScreen.width,
              height: 72,
              backgroundColor: 'white',
            }}
            titleStyle={{
              textAlign: 'left',
              fontSize: 16,
              color: '#000000',
              fontWeight: GSFont.Semibold,
            }}
            valueStyle={{
              textAlign: 'left',
              fontSize: 13,
              color: '#999999',
              fontWeight: GSFont.Regular,
              width: 100,
            }}
            onPress={() => {
              this.setState({
                showWindPicker: true,
              });
            }}
            showSeparator={false}
          />
        )}

        {
          /* 扫风 */
          !!on && !!isHadSwing && (
            <ListItemWithSwitch
              title={GSLocalize('acid20')}
              containerStyle={{
                width: MainScreen.width,
                height: 72,
                backgroundColor: 'white',
              }}
              titleStyle={{
                textAlign: 'left',
                fontSize: 16,
                color: '#000000',
                fontWeight: GSFont.Semibold,
              }}
              onValueChange={(val) => {
                this.setState({
                  swingEnable: val,
                });
              }}
              value={swingEnable}
              tintColor={'#E5E5E5'}
              onTintColor={'#57B3E7'}
              showSeparator={false}
            />
          )
        }

        {/* 睡眠结束后 */}
        {!!on && (
          <ListItem
            title={GSLocalize('acid9')}
            subtitle={
              afterSleepState == 2
                ? `${
                    afterSleepDoTitles[afterSleepState]
                  } ${delayTime} ${GSLocalize('acid94')}`
                : afterSleepDoTitles[afterSleepState]
            }
            containerStyle={{
              width: MainScreen.width,
              height: 72,
              backgroundColor: 'white',
            }}
            titleStyle={{
              textAlign: 'left',
              fontSize: 16,
              color: '#000000',
              fontWeight: GSFont.Semibold,
            }}
            subtitleStyle={{
              textAlign: 'left',
              fontSize: 13,
              color: '#999999',
              fontWeight: GSFont.Regular,
            }}
            onPress={(val) => {
              this.setState({
                showAfterSleepPicker: true,
              });
            }}
            showSeparator={false}
          />
        )}
        {/* 横线 */}
        {!!on && (
          <Text
            style={{
              marginLeft: 27,
              width: CW,
              lineHeight: 1,
              marginTop: 20,
              backgroundColor: '#E5E5E5',
              color: '#E5E5E5',
            }}
          >
            -
          </Text>
        )}
        {!!on && (
          <View
            style={{
              marginLeft: 27,
              width: CW,
              height: 236,
              backgroundColor: 'white',
            }}
          >
            {/* 头部 */}
            <View
              style={{
                width: '100%',
                height: 42,
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}
            >
              <Text
                style={{
                  width: '25%',
                  textAlign: 'center',
                  lineHeight: 14,
                  marginBottom: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#7F7F7F',
                }}
              >{`${beginTemp}°C`}</Text>
              <Text
                style={{
                  width: '50%',
                  textAlign: 'center',
                  lineHeight: 14,
                  marginBottom: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#7F7F7F',
                }}
              >{`${middleTemp}°C`}</Text>
              <Text
                style={{
                  width: '25%',
                  textAlign: 'center',
                  lineHeight: 14,
                  marginBottom: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#7F7F7F',
                }}
              >{`${endTemp}°C`}</Text>
            </View>
            {/* 中间 */}
            <View
              style={{
                width: '100%',
                height: maxTempH,
                flexDirection: 'row',
                backgroundColor: '#F7F7F7',
              }}
            >
              {/* left */}
              <View
                style={{
                  width: (CW - 2) * 0.25,
                  height: '100%',
                  flexDirection: 'column-reverse',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    height: controlBarH0,
                    width: '100%',
                    alignItems: 'center',
                    backgroundColor: '#57B3E7',
                  }}
                >
                  <View
                    style={{
                      marginTop: 4,
                      height: 4,
                      borderRadius: 2,
                      width: 32,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              </View>
              <View
                style={{ width: 1, height: '100%', backgroundColor: 'white' }}
              />

              {/* middle (CW - 2) * 0.5 - 48 */}
              <View
                style={{
                  width: (CW - 2) * 0.5,
                  height: '100%',
                  flexDirection: 'column-reverse',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    height: controlBarH1,
                    width: '100%',
                    alignItems: 'center',
                    backgroundColor: '#57B3E7',
                  }}
                >
                  <View
                    style={{
                      marginTop: 4,
                      height: 4,
                      borderRadius: 2,
                      width: 32,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              </View>
              <View
                style={{ width: 1, height: '100%', backgroundColor: 'white' }}
              />

              {/* right */}
              <View
                style={{
                  width: (CW - 2) * 0.25,
                  height: '100%',
                  flexDirection: 'column-reverse',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    height: controlBarH2,
                    width: '100%',
                    alignItems: 'center',
                    backgroundColor: '#57B3E7',
                  }}
                >
                  <View
                    style={{
                      marginTop: 4,
                      height: 4,
                      borderRadius: 2,
                      width: 32,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              </View>
              {/* 手势 */}
              {
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                  {...this.createPanResponder(0).panHandlers}
                ></Animated.View>
              }
            </View>
            {/* 尾部 */}
            <View style={{ width: '100%', height: 34 }}>
              <Text
                style={{
                  position: 'absolute',
                  marginLeft: 0,
                  width: 30,
                  textAlign: 'left',
                  lineHeight: 14,
                  marginTop: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#999999',
                }}
              >
                {startStr}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  marginLeft: CW * 0.25 - 15,
                  width: 30,
                  textAlign: 'center',
                  lineHeight: 14,
                  marginTop: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#999999',
                }}
              >
                {startStr_30}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  marginLeft: CW * 0.25 - 15 + CW * 0.5,
                  textAlign: 'center',
                  lineHeight: 14,
                  marginTop: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#999999',
                }}
              >
                {endStr_30}
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  marginLeft: CW - 30,
                  textAlign: 'right',
                  width: 30,
                  lineHeight: 14,
                  marginTop: 8,
                  fontWeight: GSFont.Regular,
                  fontSize: 10,
                  color: '#999999',
                }}
              >
                {endStr}
              </Text>
            </View>
          </View>
        )}
        {/* 虚线 */}
        {!!on &&
          GSDottedLine({
            width: MainScreen.width - 54,
            lineColor: '#e5e5e5',
            style: { marginTop: 10, marginLeft: 27 },
          })}
        {!!on && (
          <Text
            style={{
              marginBottom: 60,
              color: '#999999',
              lineHeight: 16,
              width: CW,
              textAlign: 'left',
              fontSize: 12,
              fontWeight: GSFont.Regular,
              marginTop: 20,
              marginLeft: 27,
            }}
          >
            {GSLocalize('acid8')}
          </Text>
        )}
        {
          // toast: 时间间隔不能小于多少
          !!showToast && (
            <View
              style={{
                position: 'absolute',
                borderRadius: 10,
                height: 40,
                width: MainScreen.width - 120,
                marginLeft: 60,
                backgroundColor: 'rgba(0,0,0,0.45)',
                marginTop: MainScreen.centerY(40) - 80,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{ textAlign: 'center', lineHeight: 25, color: 'white' }}
              >
                {GSLocalize('acid102')}
              </Text>
            </View>
          )
        }
      </View>
    );
  }

  onConfirmSleepDuringSetting = () => {
    const {
      willStartTime,
      willEndTime,
      startTime,
      endTime,
      willRepeats,
      repeats,
    } = this.state;
    if (Math.abs(willStartTime - willEndTime) < 120) {
      this.setState({
        willStartTime: startTime,
        willEndTime: endTime,
        willRepeats: repeats,
        showToast: true,
      });
      setTimeout(() => {
        this.setState({
          showToast: false,
        });
      }, 2000);
    } else {
      this.setState({
        startTime: willStartTime,
        endTime: willEndTime,
        repeats: willRepeats,
      });
    }
    this.setState({
      sleepDuringPickerType: -1,
    });
  };

  onCancelSleepDuringSetting = () => {
    const { startTime, endTime, repeats } = this.state;
    this.setState({
      willStartTime: startTime,
      willEndTime: endTime,
      willRepeats: repeats,
      sleepDuringPickerType: -1,
    });
  };

  // 0. 睡眠时段选择 -- 重复，开始时间，结束时间
  sleepDuringChoiceView = () => {
    const {
      willStartTime,
      willEndTime,
      startTime,
      endTime,
      selectedReatItemIndex,
      repeats,
      willRepeats,
    } = this.state;
    let startStr = SleepModePageControl.changeMintesToTimeStr(willStartTime);
    let endStr = SleepModePageControl.changeMintesToTimeStr(willEndTime);
    let repeatSubTitle = SleepModePageControl.textsOfRepeat(willRepeats);
    return (
      <GSDialogPage
        height={331}
        onHide={this.onCancelSleepDuringSetting}
        customView={
          <View>
            <ListItem
              title={GSLocalize('acid76')}
              subtitle={repeatSubTitle}
              containerStyle={{
                width: MainScreen.width,
                height: 72,
                backgroundColor: 'white',
              }}
              titleStyle={{
                textAlign: 'left',
                fontSize: 16,
                color: '#000000',
                fontWeight: GSFont.Semibold,
              }}
              subtitleStyle={{
                textAlign: 'left',
                fontSize: 13,
                color: '#999999',
                fontWeight: GSFont.Regular,
              }}
              onPress={(val) => {
                this.setState({
                  sleepDuringPickerType: 1,
                });
              }}
              showSeparator={false}
            />

            <ListItem
              title={GSLocalize('acid38')}
              subtitle={startStr} // "23:00"
              containerStyle={{
                width: MainScreen.width,
                height: 72,
                backgroundColor: 'white',
              }}
              titleStyle={{
                textAlign: 'left',
                fontSize: 16,
                color: '#000000',
                fontWeight: GSFont.Semibold,
              }}
              subtitleStyle={{
                textAlign: 'left',
                fontSize: 13,
                color: '#999999',
                fontWeight: GSFont.Regular,
              }}
              onPress={(val) => {
                this.setState({
                  sleepDuringPickerType: 3,
                });
              }}
              showSeparator={false}
            />

            <ListItem
              title={GSLocalize('acid55')}
              subtitle={endStr} // "23:00"
              containerStyle={{
                width: MainScreen.width,
                height: 72,
                backgroundColor: 'white',
              }}
              titleStyle={{
                textAlign: 'left',
                fontSize: 16,
                color: '#000000',
                fontWeight: GSFont.Semibold,
              }}
              subtitleStyle={{
                textAlign: 'left',
                fontSize: 13,
                color: '#999999',
                fontWeight: GSFont.Regular,
              }}
              onPress={(val) => {
                this.setState({
                  sleepDuringPickerType: 4,
                });
              }}
              showSeparator={false}
            />
            <View
              style={{
                width: '100%',
                height: 44,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={styles.leftButtonBgStyle}
                onPress={this.onCancelSleepDuringSetting}
              >
                <Text style={styles.cancelButtonText}>
                  {GSLocalize('acid54')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rightButtonBgStyle}
                onPress={this.onConfirmSleepDuringSetting}
              >
                <Text style={styles.confirmButtonText}>
                  {GSLocalize('acid51')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    );
  };

  // 1：重复复选 - 每天，工作日，周末，自定义
  repeatChoiceView = () => {
    const { selectedReatItemIndex } = this.state;
    console.log('=== selectedReatItemIndex: ', selectedReatItemIndex);
    let contentVieW = (
      <View>
        <SleepDuringItemCell
          title={GSLocalize('acid78')}
          onSelected={selectedReatItemIndex == 0}
          onPress={() => {
            this.onSelectRepeatValue(0); // 每天
          }}
        />
        <SleepDuringItemCell
          title={GSLocalize('acid77')}
          onSelected={selectedReatItemIndex == 1}
          onPress={() => {
            this.onSelectRepeatValue(1); // 工作日
          }}
        />
        <SleepDuringItemCell
          title={GSLocalize('acid79')}
          onSelected={selectedReatItemIndex == 2}
          onPress={() => {
            this.onSelectRepeatValue(2); // 周末
          }}
        />
        <ListItem
          title={GSLocalize('acid80')}
          containerStyle={{
            marginTop: 0,
            width: MainScreen.width,
            height: 52,
            backgroundColor: 'white',
          }}
          titleStyle={{
            textAlign: 'left',
            fontSize: 16,
            color: '#000000',
            fontWeight: GSFont.Regular,
            height: 20,
          }}
          onPress={(val) => {
            this.onSelectRepeatValue(3); // 自定义
          }}
          showSeparator={false}
        />
      </View>
    );
    return (
      <GSDialogPage
        title={GSLocalize('acid81')}
        height={306}
        customView={contentVieW}
        onHide={() => {
          this.setState({
            sleepDuringPickerType: 0,
          });
        }}
      />
    );
  };

  // 2.自定义重复 - 周日，周一 ... 周六
  customRepeatView = () => {
    return (
      <ChoiceDialog
        type={ChoiceDialog.TYPE.MULTIPLE}
        visible={true}
        title={GSLocalize('acid82')}
        options={[
          { title: GSLocalize('acid89') },
          { title: GSLocalize('acid83') },
          { title: GSLocalize('acid84') },
          { title: GSLocalize('acid85') },
          { title: GSLocalize('acid86') },
          { title: GSLocalize('acid87') },
          { title: GSLocalize('acid88') },
        ]}
        selectedIndexArray={this.state.repeats}
        color="#57B3E7"
        buttons={[
          {
            text: GSLocalize('acid54'),
            style: { color: '#F5F5F5' },
            callback: (result) => {
              this.setState({
                sleepDuringPickerType: 0, // -1
              });
            },
          },
          {
            text: GSLocalize('acid51'),
            style: { color: '#00B3DE' },
            callback: (result) => {
              console.log('======result: ', result);
              this.setState({
                sleepDuringPickerType: 0, // -1
                selectedReatItemIndex: 3,
                willRepeats: result,
              });
            },
          },
        ]}
        canDismiss={() => {}}
        onDismiss={() => {
          this.setState({
            sleepDuringPickerType: 0, // -1
          });
        }}
      />
    );
  };

  // 3. 开始时间
  benginTimeView = () => {
    return (
      <MHDatePicker
        animationType="fade"
        datePickerStyle={datePickerStyle}
        visible={true}
        title={GSLocalize('acid38')}
        showSubtitle={true}
        confirmColor="#57b3e7"
        type={MHDatePicker.TYPE.TIME24}
        current={SleepModePageControl.changeMintesToArray(
          this.state.willStartTime
        )}
        onSelect={(res) => {
          console.log('======resres:', res);
          this.setState({
            sleepDuringPickerType: 0, // -1
            willStartTime: SleepModePageControl.changeArrayToMinutes(
              res.rawArray
            ),
          });
        }}
        onDismiss={(_) => {
          this.setState({
            sleepDuringPickerType: 0, // -1
          });
        }}
      />
    );
  };
  // 4. 开始时间
  endTimeView = () => {
    return (
      <MHDatePicker
        animationType="fade"
        datePickerStyle={datePickerStyle}
        visible={true}
        title={GSLocalize('acid55')}
        showSubtitle={true}
        confirmColor="#57b3e7"
        type={MHDatePicker.TYPE.TIME24}
        // singleType={MHDatePicker.SINGLE_TYPE.HOUR}
        current={SleepModePageControl.changeMintesToArray(
          this.state.willEndTime
        )}
        min={['0', '0']}
        max={['23', '59']}
        onSelect={(res) => {
          this.setState({
            sleepDuringPickerType: 0, // -1
            willEndTime: SleepModePageControl.changeArrayToMinutes(
              res.rawArray
            ),
          });
        }}
        onDismiss={(_) => {
          this.setState({
            sleepDuringPickerType: 0, // -1
          });
        }}
      />
    );
  };

  // 显示 风速picker
  windSpeedTitles = () => [
    GSLocalize('acid16'),
    GSLocalize('acid92'),
    GSLocalize('acid91'),
    GSLocalize('acid90'),
  ];
  windPickerView = () => {
    let speeds = SleepModePageControl.windSpeeds();
    if (!speeds || speeds.length == 0) {
      return undefined;
    }
    return (
      <ChoiceDialog
        visible={true}
        title={GSLocalize('acid15')}
        options={speeds.map((val) => {
          return { title: this.windSpeedTitles()[val] };
        })}
        canDismiss={() => {}}
        selectedIndexArray={[this.state.windValue]}
        onDismiss={() => {
          this.setState({
            showWindPicker: false,
          });
        }}
        onSelect={(value) => {
          this.setState({
            windValue: value[0],
          });
        }}
      />
    );
  };

  // 睡眠结束后
  afterSleepView = () => {
    const { afterSleepState, delayTime } = this.state;
    let contentVieW = (
      <View>
        <SleepDuringItemCell
          title={afterSleepDoTitles[1]}
          onSelected={afterSleepState == 1}
          onPress={() => {
            this.onSelectAfterSleep(1);
          }}
        />
        <SleepDuringItemCell
          title={afterSleepDoTitles[0]}
          onSelected={afterSleepState == 0}
          onPress={() => {
            this.onSelectAfterSleep(0);
          }}
        />
        <ListItem
          title={afterSleepDoTitles[2]}
          containerStyle={{
            marginTop: 0,
            width: MainScreen.width,
            height: 52,
            backgroundColor: 'white',
          }}
          titleStyle={{
            textAlign: 'left',
            fontSize: 16,
            color: afterSleepState == 2 ? '#57B3E7' : '#000000',
            fontWeight: GSFont.Regular,
            height: 20,
          }}
          onPress={(val) => {
            this.onSelectAfterSleep(2);
          }}
          value={`${delayTime}${GSLocalize('acid94')}`}
          valueStyle={{ width: 100 }}
          showSeparator={false}
        />
      </View>
    );
    return (
      <GSDialogPage
        title={GSLocalize('acid9')}
        height={168 + 66 + 20}
        customView={contentVieW}
        onHide={() => {
          this.setState({
            showAfterSleepPicker: false,
          });
        }}
      />
    );
  };

  // 延迟关闭时间
  delayColseTimePickerView = () => {
    return (
      <MHDatePicker
        animationType="fade"
        datePickerStyle={{
          titleStyle: {
            color: '#333333',
            fontSize: 16,
            lineHeight: 22,
            fontWeight: GSFont.Semibold,
          },
          leftButtonStyle: {
            color: '#333333',
            fontWeight: GSFont.Semibold,
            fontSize: 14,
          },
          rightButtonStyle: {
            color: '#FFFFFF',
            fontWeight: GSFont.Semibold,
            fontSize: 14,
          },
          leftButtonBgStyle: {
            bgColorNormal: '#F5F5F5',
          },
          rightButtonBgStyle: {
            bgColorNormal: '#57B3E7',
          },
        }}
        visible={true}
        title={GSLocalize('acid93')}
        showSubtitle={false}
        confirmColor="#57b3e7"
        type={MHDatePicker.TYPE.SINGLE}
        singleType={MHDatePicker.SINGLE_TYPE.MINUTE}
        current={[`${this.state.delayTime}`]}
        min={['1']}
        max={['59']}
        onSelect={(res) => {
          // 点击确认，onDismiss 也会执行。 很怪异。 需要加个 hadOnConfirmDelayTime 屏蔽下。
          console.log('====valvalval=====', res);
          this.hadOnConfirmDelayTime = true;
          this.setState({
            showDelayClosePicker: false,
            afterSleepState: 2,
            delayTime: parseInt(res.rawArray[0]),
          });
        }}
        onDismiss={(val) => {
          // ///// =====
          console.log('====valvalval 2222=====', val);
          if (this.hadOnConfirmDelayTime) {
            this.hadOnConfirmDelayTime = false;
            return;
          }
          this.setState({
            showDelayClosePicker: false,
            showAfterSleepPicker: true,
          });
        }}
      />
    );
  };

  onSelectAfterSleep = (index, val = 0) => {
    if (index == 2) {
      this.setState({
        showAfterSleepPicker: false,
        showDelayClosePicker: true,
        afterSleepState: index,
      });
    } else {
      this.setState({
        afterSleepState: index,
        showAfterSleepPicker: false,
      });
    }
  };

  onSelectRepeatValue = (index) => {
    if (index == 3) {
      // 显示自定义重复
      this.setState({
        sleepDuringPickerType: 2,
      });
    } else {
      // 选中，每天，工作日，周末
      this.setState({
        selectedReatItemIndex: index,
        willRepeats: SleepModePageControl.repeatsOfType(index),
        sleepDuringPickerType: 0,
      });
    }
  };
}
const minTempH = 12.0;
const maxTempH = 160.0;
const afterSleepDoTitles = [
  GSLocalize('acid11'),
  GSLocalize('acid10'),
  GSLocalize('acid93'),
];
const CW = MainScreen.width - 54; // content width.
const styles = StyleSheet.create({
  container: {
    width: MainScreen.width,
    height: '100%',
    backgroundColor: 'white', // #4d85fe
  },

  cancelButtonText: {
    color: '#333333',
    fontWeight: GSFont.Semibold,
    fontSize: 14,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: GSFont.Semibold,
    fontSize: 14,
  },

  leftButtonBgStyle: {
    backgroundColor: '#F5F5F5',
    width: 153 * (MainScreen.width / 375),
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rightButtonBgStyle: {
    marginLeft: 12,
    backgroundColor: '#57B3E7',
    width: 153 * (MainScreen.width / 375),
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const datePickerStyle = {
  titleStyle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: GSFont.Semibold,
  },
  leftButtonStyle: {
    color: '#333333',
    fontWeight: GSFont.Semibold,
    fontSize: 14,
  },
  rightButtonStyle: {
    color: '#FFFFFF',
    fontWeight: GSFont.Semibold,
    fontSize: 14,
  },
  leftButtonBgStyle: {
    bgColorNormal: '#F5F5F5',
  },
  rightButtonBgStyle: {
    bgColorNormal: '#57B3E7',
  },
  subTitleStyle: {
    color: '#666666',
    fontWeight: GSFont.Regular,
    fontSize: 14,
  },
};
