/*
 * @Author: huayou.fu 
 * @Created date: 2022-01-13 18:33:02 
 */
import React from "react";
import { Text, View } from "react-native";
export const GSDottedLine = ({ width, lineColor = '#E5E5E5', style = {} }) => {
  const aWidth = width / 4;
  const dottes = [];
  for (let i = 0; i < aWidth; i++) {
    dottes.push(i);
  }
  return <View style={{ flexDirection: 'row', width: width, justifyContent: 'center', overflow: 'hidden', ...style }}>
    {
      dottes.map((value, index) => {
        return <Text key={index} style={{ marginLeft: 2, backgroundColor: lineColor, textAlign: 'center', height: 1 }}>{' '}</Text>;
      })
    }
  </View>;
};
