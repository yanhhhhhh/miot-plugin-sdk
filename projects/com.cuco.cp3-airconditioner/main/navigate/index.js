/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-04 15:17:35 
 * 导航控制器相关的路由配置
 */
import Package from "miot/Package";
import { createStackNavigator } from "react-navigation-stack";
import NavigationActions from "react-navigation/src/NavigationActions";
import StackActions from "react-navigation/src/routers/StackActions";
import GSBrandsSectionListPage from "../pages/SetControllID/GSBrandsSectionList";
import FuTestingPage from "../demos/fu-demo/FuTestingPage";
import { GSDevWarn } from "../helper/GSLog";
import { HomePage, SettingPage, SetControllIDPage, RootLoadingPage } from "../pages";
import { DelayClosePage, ElectricStatisticsPage, SleepModePage, TimingPage, FastCoolingPage } from "../pages/home";
import GSMatchCodePage from "../pages/SetControllID/GSMatchCodePage";
import { IndicatorLightPage, MoreSetting } from "../pages/setting";
import GSSectionListSearchPage from "../pages/SetControllID/GSSectionListSearchPage";
import GSMatchCodeSuccessPage from "../pages/SetControllID/GSMatchCodeSuccessPage";
import GSMatchCodeFailPage from "../pages/SetControllID/GSMatchCodeFailPage";

// =========== home 里面的跳转页面路由 =======
const HomeRouteConfigs = {
  ElectricStatistics: { screen: ElectricStatisticsPage },
  SleepMode: { screen: SleepModePage },
  Timing: { screen: TimingPage },
  FastCooling: { screen: FastCoolingPage },
  DelayClose: { screen: DelayClosePage }
};

// =========== Setting 里面的跳转页面路由 =======
const SettingRouteConfigs = {
  IndicatorLight: { screen: IndicatorLightPage },
  MoreSetting: { screen: MoreSetting }
};

// ===========  （root）根导路由 =========
const rootRouteConfigs = {
  RootLoading: { screen: RootLoadingPage },
  SetControllID: { screen: SetControllIDPage },
  Home: { screen: HomePage },
  Setting: { screen: SettingPage },
  FuTesting: { screen: FuTestingPage },
  GSBrandsSectionList: { screen: GSBrandsSectionListPage },
  GSSectionListSearch: { screen: GSSectionListSearchPage },
  GSMatchCode: { screen: GSMatchCodePage },
  GSMatchCodeSuccess: { screen: GSMatchCodeSuccessPage, navigationOptions: { gesturesEnabled: false } },
  GSMatchCodeFail: { screen: GSMatchCodeFailPage, navigationOptions: { gesturesEnabled: false } },
  ...HomeRouteConfigs,
  ...SettingRouteConfigs
};
export const createRootStack = (initPage) => {
  return createStack(rootRouteConfigs, initPage);
};

const createStack = (routeConfigs, initPage) => {
  return createStackNavigator(routeConfigs,
    {
      initialRouteName: initPage,
      navigationOptions: ({ navigation }) => {
        // console.log('=======: navigation: ', navigation);
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
    },
  );
};

/**
 * 返回
 */
export const navigatePopPage = (from) => {
  from.props.navigation?.goBack();
};

/**
 * 跳转到某一个页面
 */
export const navigatePushPage = (from, to, parmas = {}) => {
  from.props.navigation?.navigate(to, parmas);
};

/**
 * 重置根路由
 */
export const navigateReset = (from, toName) => {
  const resetAction = StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({ routeName: toName }) // 要跳转的路由
    ]
  });
  from.props.navigation.dispatch(resetAction);
};

/**
 *  退出插件
 */
export const appExit = () => {
  Package.exit();
};
