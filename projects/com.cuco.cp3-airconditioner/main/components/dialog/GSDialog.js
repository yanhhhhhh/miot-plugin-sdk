/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-12 20:11:15 
 */

import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GSDevWarn } from "../../helper/GSLog";
import { hexToRGBA, MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";


export default class GSDialogPage extends React.PureComponent {
    static defaultProps = {
      height: 358,
      title: undefined,
      onHide: () => {},
      customView: <View style={{ height: 100, backgroundColor: 'white', flex: 1 }} />,
      didMount: false,
      containerStyle: {},
      dismissSpaceStyle: {}
    }

    constructor(props) {
      super(props);
      this.state = {
        height: this.props.height,
        title: this.props.title,
        onHide: this.props.onHide,
        customView: this.props.customView,
        didMount: this.props.didMount
      };
    }
    
    componentDidUpdate(prevProps) {
      const { customView, title, height } = this.props;
      if (customView != prevProps.customView || title != prevProps.title || height != prevProps.height) {
        this.setState({
          customView: this.props.customView,
          title: this.props.title,
          height: this.props.height
        });
      }
      this.setState({
        onHide: this.props.onHide
      });
    }

    componentDidMount() {
      setTimeout(() => {
        this.setState({
          didMount: true
        });
      }, 100);
    }

    render() {
      const { onHide, height, title, customView, didMount } = this.state;
      return <View style={styles.container}>
        <TouchableOpacity onPress={
          () => { onHide(); }
        } style={{ position: 'absolute', width: '100%', height: MainScreen.height - height, backgroundColor: 'transparent', marginBottom: height, ...this.props.dismissSpaceStyle }} />
        <View style={{ ...styles.customContainer, height: height, ...this.props.containerStyle }}>
          <Text style={{ ...styles.title, height: title ? 66 : 27 }}>{title ? title : ''}</Text>
          {didMount && <ScrollView style={{ ...styles.customView }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} bounces={false}>
            {
              customView
            }
          </ScrollView>}
        </View>
      </View>;
    }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10000,
    width: MainScreen.width,
    height: MainScreen.height,
    flex: 1,
    backgroundColor: hexToRGBA('#000000', 0.4),
    flexDirection: 'column-reverse'
  },

  customContainer: {
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    height: 358,
    flexDirection: 'column'
  },

  title: {
    height: 66,
    width: '100%',
    color: '#333333',
    fontWeight: GSFont.Semibold,
    fontSize: 16,
    lineHeight: 66,
    textAlign: 'center'
  },

  customView: {
    marginTop: 0,
    width: '100%',
    height: 292
  }
    
});