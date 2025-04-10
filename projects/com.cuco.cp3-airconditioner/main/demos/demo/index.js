import { NavigationBar } from "mhui-rn";
import React from "react";
import { SafeAreaView } from "react-native";
import { View } from "react-native";
import { createStackNavigator } from "react-navigation-stack";
import { GSBrandsPickerPage } from "./GSBrandsPickerPage";
import { GSListPickerPage } from "./GSListPickerPage";
import iMain from "./iMain";
import iSecondPage from "./iSecondPage";


export default class App extends React.PureComponent {
  render() {
    const Root = createRootStack();
    return <Root />;
  }      
}

function createRootStack(initPage) {
  return createStackNavigator(
    {
      MainPage: iMain,
      SecondPage: iSecondPage,
      GSBrandsPicker: GSBrandsPickerPage,
      GSListPicker: GSListPickerPage
    },
    {
      initialRouteName: 'MainPage',
      navigationOptions: ({ navigation }) => {
  
        let { titleProps, title } = navigation.state.params || {};
        // 如果 titleProps和title 都为空， 则不显示页面header部分
        if (!titleProps && !title) return { header: null };
  
        // 如果titleProps为空， 则title肯定不为空， 初始化titleProps并赋值title
        if (!titleProps) {
          titleProps = {
            title: title
          };
        }
          
        if (!titleProps.left) {
          titleProps.left = [
            {
              key: NavigationBar.ICON.BACK,
              onPress: () => {
                navigation.goBack();
              }
            }
          ];
        }
        return {
          header: <NavigationBar {...titleProps} />
        };
      }
    }
  );
}
  