/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-10 13:43:02 
 * 系统全局配置
 */

import darkmode from "miot/darkmode";

export const GSSystem = {

  darkmode: darkmode.getColorScheme(), // null | 'light' | 'dark';

  isDarkMode: () => {
    return GSSystem.darkmode === 'dark';
  }
  
};