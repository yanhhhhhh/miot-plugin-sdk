

import darkmode from "miot/darkmode";

export const GSSystem = {

  darkmode: darkmode.getColorScheme(), // null | 'light' | 'dark';

  isDarkMode: () => {
    return GSSystem.darkmode === 'dark';
  }
  
};