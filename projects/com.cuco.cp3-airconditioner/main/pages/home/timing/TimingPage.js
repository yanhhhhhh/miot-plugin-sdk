/*
 * @Author: huayou.fu
 * @Created date: 2022-01-08 15:17:13
 * 周电量统计
 */
import { NavigationBar } from 'mhui-rn';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import SafeAreaBaseContainer from '../../../components/SafeArea/SafeAreaBaseContainer';
import { navigatePopPage } from '../../../navigate';
import { MainScreen } from '../../../styles';

export default class TimingPage extends SafeAreaBaseContainer {
  constructor(props) {
    super(props);
    this.state = {};
  }

  gsRender() {
    this.baseSetBackgroundColor(styles.container.backgroundColor);
    this.baseRemoveTopNaviMargin();
    {
      /* 导航栏 */
    }
    this.setNavigationBar(
      <NavigationBar
        backgroundColor="transparent"
        type={NavigationBar.TYPE.DARK}
        left={[
          {
            key: NavigationBar.ICON.BACK,
            onPress: () => {
              navigatePopPage(this);
            },
          },
        ]}
        title={'定时'}
        onPressTitle={() => {}}
      />
    );
    return <View style={styles.container}></View>;
  }
}

const styles = StyleSheet.create({
  container: {
    width: MainScreen.width,
    height: '100%',
    backgroundColor: '#4d85fe',
  },
});
