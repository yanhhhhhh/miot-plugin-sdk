/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-20 11:45:11 
 */
export const GSDevWarn = (mess) => {
  if (__DEV__ && console.warn) {
    console.warn(JSON.stringify(mess));
  }
};
