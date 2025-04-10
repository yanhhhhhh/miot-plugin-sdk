

import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { GSImage } from "../../constants/image/image";
import { IconStyles, MainScreen } from "../../styles";
import { GSFont } from "../../styles/font";

export default class SleepDuringItemCell extends React.PureComponent {  
    static defaultProps = {
      title: 'text',
      titleStyle: {
        normal: {
          marginLeft: 27,
          color: '#000000',
          fontSize: 16,
          fontWeight: GSFont.Regular,
          lineHeight: 52,
          width: '100%'
        },
        selected: {
          marginLeft: 27,
          color: '#00D3BE',
          fontSize: 16,
          fontWeight: GSFont.Regular,
          lineHeight: 52,
          width: '100%'
        }
      },
      onPress: () => {},
      onSelected: false,
      baseContainerStyle: {
        height: 52, 
        width: MainScreen.width
      },
      containerStyle: {}
    }

    constructor(props) {
      super(props);
      this.state = {
        title: this.props.title,
        titleStyle: this.props.titleStyle,
        onPress: this.props.onPress,
        onSelected: this.props.onSelected,
        containerStyle: this.props.containerStyle
      };
    }

    componentDidUpdate(prevProps) {
      const { onSelected } = this.props;
      console.log('======= onSelected: ', onSelected);
      if (onSelected != prevProps.onSelected) {
        this.setState({
          onSelected: this.props.onSelected
        });
      }
    }

    render() {
      const { title, titleStyle, onPress, onSelected, containerStyle } = this.state;
      let tStyle = !onSelected ? titleStyle.normal : titleStyle.selected;
      let H = this.props.baseContainerStyle.height;
      if (containerStyle.height) {
        H = containerStyle.height;
      }
      return <View style = {{ ...this.props.baseContainerStyle, ...containerStyle }}>
        <TouchableOpacity style = {{ flex: 1 }} onPress={onPress}>
          <Text style = {{ ...tStyle }}>{title}</Text>
        </TouchableOpacity>
        {
          !!onSelected && <Image source={GSImage.rightArrowGreen} style = {{ ...IconStyles.size16, position: 'absolute', marginLeft: 7, marginTop: (H - 16) / 2.0 }} />
        }
      </View>;
    }
}