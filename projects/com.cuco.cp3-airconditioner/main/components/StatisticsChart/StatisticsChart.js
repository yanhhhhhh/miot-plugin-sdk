/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-12 14:46:27 
 * 柱状统计图
 */
import React from "react";
import { Dimensions, View, Text, PanResponder } from "react-native";
import { GSDevWarn } from "../../helper/GSLog";
import { hexToRGBA } from "../../styles";
const sW = Dimensions.get('window').width;
const defaultContainerStyle = { height: 190, width: sW };
const yAxisWidth = 32;
import { DateManagerMgr } from "../../helper/date/date";
export default class StaticChart extends React.PureComponent {

    static defaultProps = {
      containerStyle: defaultContainerStyle,
      type: 'week', // week|month
      // values: [{val:'0.2', txt:'周五'},  {val:'1.0', txt:'周六'}, {val:'2', txt:'周日'}, {val:'0', txt:'周一'}, {val:'0.5', txt:'周二'}, {val:'0', txt:'周三'}, {val:'0', txt:'周四'}],
      // xAxis: ['周五', '周六','周日','周一','周二','周三','周四'],
      // yAxis:['0.0', '1', '1.5', '2.0', '2.5'],
      // valueRange: [0.0, 2.5],
      // xAxis: ['周五', '周六', '周日', '周一', '周二', '周三', '周四'],
      values: [],
      xAxis: [],
      yAxis: [],
      valueRange: [],
      selectedWhichOne: 0,
      onSelectWhichOne: () => {}
    };

    constructor(props) {
      super(props);
      this.state = {
        containerStyle: defaultContainerStyle,
        type: 'week', // week|month
        // values: [{ val: '0.2', txt: '周五' }, { val: '1.0', txt: '周六' }, { val: '2', txt: '周日' }, { val: '0', txt: '周一' }, { val: '0.5', txt: '周二' }, { val: '0', txt: '周三' }, { val: '0', txt: '周四' }],
        // xAxis: ['周五', '周六', '周日', '周一', '周二', '周三', '周四'],
        // yAxis: ['0.0', '1', '1.5', '2.0', '2.5'],
        // valueRange: [0.0, 2.5],
        values: [],
        xAxis: [],
        yAxis: [],
        valueRange: [],
        didMount: false,
        selectedWhichOne: this.props.selectedWhichOne
      };
    }

    componentDidUpdate(prevProps) {
      const { type, values, xAxis, yAxis, valueRange, selectedWhichOne } = this.props;
      if (type != prevProps.type ||
            values != prevProps.values ||
            xAxis != prevProps.xAxis || 
            yAxis != prevProps.yAxis ||
            valueRange != prevProps.valueRange ||
      selectedWhichOne != prevProps.selectedWhichOne) {
        this.setState({
          type: this.props.type,
          values: this.props.values,
          xAxis: this.props.xAxis,
          yAxis: this.props.yAxis,
          valueRange: this.props.valueRange,
          selectedWhichOne: this.props.selectedWhichOne
        });
      }
    }

    componentDidMount() {
      this.setState({
        containerStyle: this.props.containerStyle,
        type: this.props.type,
        values: this.props.values,
        xAxis: this.props.xAxis,
        yAxis: this.props.yAxis,
        valueRange: this.props.valueRange,
        didMount: true
      });
    }

    // 手势
    createPanResponder = (index) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderStart: (e, g) => {},
        onPanResponderGrant: (e, gestureState) => {
          let x0 = gestureState.x0; 
          let whichOne = this.calculateSelectPoint(x0);
          const { selectedWhichOne } = this.state;
          if (whichOne != selectedWhichOne) {
            this.setState({
              selectedWhichOne: whichOne
            });
            this.props.onSelectWhichOne(whichOne);
          }
        },
        onPanResponderMove: (e, g) => {},
        onPanResponderRelease: (e, g) => {},
        onResponderTerminationRequest: (event) => true,
        onPanResponderTerminate: (evt, gestureState) => {}
      });
    }

    calculateSelectPoint = (X0) => {
      const { type, values, containerStyle, selectedWhichOne } = this.state;
      const iContainerStyle = { ...defaultContainerStyle, ...containerStyle };
      let W = iContainerStyle.width;
      let cellW = type === 'week' ? 26 : 4;
      let cellMargin = (W - yAxisWidth - (values.length * cellW)) / (values.length - 1);
      let whichOne = selectedWhichOne;
      let maginL = (sW - W) / 2.0;
      let x = X0 - maginL;
      if (x < 0) {
        return whichOne;
      }
      values.map((val, index) => {
        let range = [0, 0];
        if (index == 0) {
          range = [0, cellW + 0.5 * cellMargin];
        } else if (index == values.length - 1) {
          range = [cellW * index + ((index - 1) + 0.5) * cellMargin, cellW * index + ((index - 1) + 0.5) * cellMargin + cellW + 0.5 * cellMargin + 20];
        } else {
          range = [cellW * index + ((index - 1) + 0.5) * cellMargin, cellW * index + ((index - 1) + 0.5) * cellMargin + cellW + cellMargin];
        }  
        if (x >= range[0] && x <= range[1]) {
          whichOne = index;
        }
      });
      return whichOne;
    }
    
    render() {
      const { type, values, xAxis, yAxis, valueRange, containerStyle, didMount, selectedWhichOne } = this.state;
      const iContainerStyle = { ...defaultContainerStyle, ...containerStyle };
      let W = iContainerStyle.width;
      let H = iContainerStyle.height;
      let cellW = type === 'week' ? 26 : 4;
      let cellMargin = (W - yAxisWidth - (values.length * cellW)) / (values.length - 1); // 32是y坐标轴的宽度
      let contentHeight = H - 47;
      let xAxisTxtH = 45;
      // console.log("contentHeight:", contentHeight);
      // contentHeight = 100;
      // let xAxisTxtW =  (W - 32)/xAxis.length;
      let xAxisTxtWs = calculateWeekXAxis(xAxis, cellW, cellMargin);
      let dVal = yAxis[yAxis.length - 1] - yAxis[0];
      let iYAxis = Array().concat(yAxis).reverse(); // 反转y轴title
      return <View style={{ ...iContainerStyle, flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: W - yAxisWidth, flexDirection: 'column' }} >
          {/* 虚线 */}
          {!!didMount && GSDotted({ width: W - yAxisWidth })}

          {/* 中间柱状图 */}
          <View {...this.createPanResponder(0).panHandlers} style={{ height: contentHeight, width: '100%', flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white' }} >
            {/* <View style = {{height:contentHeight, width:'100%',  flexDirection: 'row', alignItems: 'flex-end', backgroundColor:'white'}}> */}
            {
              values.map((val, index) => {
                let value = parseFloat(val.val);
                let cH = dVal == 0 ? 0 : ((value - yAxis[0]) / dVal) * contentHeight;
                if (cH < 2) {
                  cH = 2.0;
                }
                let bgColor = selectedWhichOne == index ? hexToRGBA('#00D3BE', 1.0) : hexToRGBA('#00D3BE', 0.3);
                return <View key={index} style={{ width: cellW, marginLeft: (index == 0) ? 0 : cellMargin, height: cH, backgroundColor: bgColor }}><Text></Text></View>;
              })
            }
            {/* </View> */}
          </View>

          {/* 虚线 */}
          {!!didMount && GSDotted({ width: W - yAxisWidth })}

          {/* x轴 */}
          <View style={{ height: xAxisTxtH, width: '100%', paddingBottom: 9, flexDirection: 'row', justifyContent: 'space-between' }}>
            {
              type == 'week' ? xAxis.map((val, index) => {
                let align = 'center';
                let padL = 0;
                let padR = 0;
                if (index == 0) {
                  align = 'left';
                  padL = 2;
                  padR = 0;
                } else if (index == xAxis.length - 1) {
                  align = 'right';
                  padL = 0;
                  padR = 2;
                }
                return <Text key={index} style={{ textAlign: align, paddingLeft: padL, paddingRight: padR, width: xAxisTxtWs[index], lineHeight: 36, color: '#999999', fontSize: 10 }}>
                  {val}
                </Text>;
              }) : xAxis.map((val, index) => {
                let w = val === "" ? cellW : 28;
                return <Text key={index} style={{ textAlign: 'center', width: w, lineHeight: 36, color: '#999999', fontSize: 10 }}>
                  {val}
                </Text>;
              })
            }
          </View>
        </View>
        {/* y轴 */}
        <View style={{ width: yAxisWidth, height: contentHeight + 2, flexDirection: 'column', justifyContent: 'space-between' }}>
          {
            iYAxis.map((val, index) => {
              return <Text style={{ lineHeight: 16, width: '100%', fontSize: 12, color: '#999999', textAlign: 'right' }} key={index}>{val}</Text>;
            })
          }
        </View>
      </View>;
    }


}

const calculateWeekXAxis = (xAxis: Array, cW, mX, W) => {
  let points = [];
  xAxis.map((val, index) => {
    if (index == 0) {
      points.push((cW + mX / 2.0));
    } else if (index !== xAxis.length - 1) {
      points.push((cW + mX));
    } else {
      points.push((cW + mX / 2.0));
    }
  });
  return points;
};

const GSDotted = (style) => {
  const width = style.width / 4;
  const dottes = [];
  for (let i = 0; i < width; i++) {
    dottes.push(i);
  }
  return (
    <View style={{ flexDirection: 'row', width: style.width, justifyContent: 'center', overflow: 'hidden' }}>
      {
        dottes.map((value, index) => {
          return <Text key={index} style={{ marginLeft: 2, backgroundColor: '#E5E5E5', textAlign: 'center', height: 1 }}>{' '}</Text>;
        })
      }
    </View>
  );
};
