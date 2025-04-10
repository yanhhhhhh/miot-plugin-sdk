import { Resources } from 'miot';
import { Language } from 'miot/resources';

const lan = Resources.getLanguage();
import PluginStrings from "../../../resources/strings";

export function GSLocalize(key) {
  return PluginStrings[key] ? PluginStrings[key] : "";
}

export function ExchangeTxtPosition(word1, word2, split = '') {
  if (lan == Language.zh) {
    return word1 + split + word2; 
  } else {
    if (split == "") {
      split = " ";
    }
    return word2 + split + word1; 
  }
}

export const isCurrentEnglish = () => {
  return lan === Language.en;
};


export const isCurrentChinese = () => {
  let iLan:String = lan;
  return iLan.toLowerCase().indexOf('zh') != -1;
};