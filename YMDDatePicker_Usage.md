# YMDDatePicker 组件使用说明

该文档详细介绍了 `YMDDatePicker` 组件的属性和事件，方便开发者理解和使用。

## 代码逐行解释

```javascript
// 导入 React 相关的 Hooks 和组件
import React, { useMemo, useState, useContext, useEffect } from 'react';
// 导入 React Native 基础组件
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
// 导入 SVG 相关组件，用于绘制图标
import Svg, { Circle, Path } from 'react-native-svg';
// 导入日期处理相关的工具函数
import {
  InitAllDate,
  FormatDate,
  InitDates,
  GetRangeDate,
  ResortWeek,
  GiveArrayWeek,
} from './utils';
// 导入组件的样式
import style from './styles';
// 导入常量，如面板类型、星期、颜色和默认属性
import { PanelType, AllWeeks, Colors, DefaultProp } from './const';
// 导入全局配置上下文，用于获取主题和语言设置
import { ConfigContext } from '../configProvider';
// 导入本地化文本
import { Locale } from '../../locale';

// 定义一个二维数组，用于给日期单元格生成唯一的 key
const Key = [
  ['1-0', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7'] /* ... 其他行 ... */,
];

// 定义 YMDDatePicker 函数式组件
const YMDDatePicker = (props) => {
  // 解构 props，并设置默认值
  const {
    range = false, // 是否为范围选择
    date = [], // 初始选中的日期，支持数组（多选/范围）或单个值
    backgroundColor, // 组件背景色
    button = {}, // 底部按钮文本配置 { confirm: '确定', cancel: '取消' }
    fullscreen = false, // 是否全屏显示
    buttonColor = {}, // 底部按钮颜色配置 { confirm: '#32BAC0', cancel: 'rgba(0, 0, 0, 0.06)' }
    visible = false, // 控制 Modal 是否可见
    closeImmediately = false, // 选择后是否立即关闭 Modal
    onSelected, // 日期选择完成后的回调函数
    multiple = false, // 是否支持多选
    onChangePanelBefore, // 切换月份/年份面板前的回调
    onChangePanelTypeBefore, // 切换日期/月份视图前的回调
    showAdjacentMonths = false, // 是否显示相邻月份的日期
    showWeek = false, // 是否显示周数
    localeFirstDayOfYear = 4, // 一年中第一周的起始日（0-6，周日-周六）
    allowDates, // 函数，用于判断哪些日期可选 (v: string) => boolean
    readonly = false, // 是否只读
    onCancel, // 取消按钮或点击遮罩层时的回调
    hideOverlay = false, // 是否隐藏遮罩层
    persistent = true, // 点击遮罩层是否可以关闭 Modal
    overlayOpacity = 0.4, // 遮罩层透明度
    overlayColor = '#000', // 遮罩层颜色
    firstDayOfWeek = 0, // 一周的第一天（0-6，周日-周六）
  } = props;

  // 获取全局配置上下文
  const context = useContext(ConfigContext);
  // 使用 useMemo 初始化和格式化传入的日期，依赖 props.date
  const dates = useMemo(() => InitDates(date, range), [props.date]);
  // 获取当前主题（'light' 或 'dark'）
  const theme = context.colorScheme || 'light';
  // 获取当前语言的本地化文本对象
  const language = Locale.of(context.language);

  // 使用 useState 管理当前选中的日期状态
  const [selected, Selected] = useState(dates);
  // 使用 useState 管理当前日历显示的日期（用于切换月份/年份）
  const [show, Show] = useState(dates[0] ? new Date(dates[0]) : new Date());
  // 使用 useState 管理范围选择的起始点击日期
  const [rangeClick, RangeClick] = useState('');
  // 使用 useState 管理当前显示的面板类型（'date' 或 'month'）
  const [panel, Panel] = useState(props.panel);

  // 获取当前显示日期的年份和月份
  const year = show.getFullYear();
  const month = show.getMonth() + 1; // getMonth 返回 0-11，需要 +1

  // 使用 useMemo 格式化最大可选日期和最小可选日期，依赖 props.max/min
  const max = useMemo(() => FormatDate(new Date(props.max)), [props.max]);
  const min = useMemo(() => FormatDate(new Date(props.min)), [props.min]);

  // 使用 useEffect 监听 props.panel 的变化，同步更新内部 panel 状态
  useEffect(() => Panel(props.panel), [props.panel]);
  // 使用 useEffect 监听 props.date 的变化，更新选中的日期和显示的日期
  useEffect(() => {
    // 根据当前面板类型格式化日期（'date'保留完整，'month'保留年月）
    Selected(dates.map((v) => (props.panel === 'date' ? v : v.slice(0, 7))));
    // 更新日历显示的日期为选中日期的第一个，若无则为当前日期
    Show(dates[0] ? new Date(dates[0]) : new Date());
  }, [props.date]);

  // 处理标题显示逻辑
  let title = props.title;
  title =
    typeof title === 'string' || title === false
      ? title
      : panel === 'date'
      ? language.selectDate
      : language.selectMonth;

  // 定义关闭 Modal 时的回调函数
  const onClose = (s = selected) => {
    // 根据选择模式（范围/多选/单选）格式化最终选中的值
    if (range) s = [s[0], s[s.length - 1]]; // 范围选择返回开始和结束日期
    else if (!multiple) s = s[0]; // 单选返回单个日期
    // 调用外部传入的 onSelected 回调
    onSelected && onSelected(s);
    // 调用外部传入的 onCancel 回调（关闭 Modal）
    onCancel && onCancel();
  };

  // 定义切换显示月份/年份的函数
  const setShow = (y, m, step) => {
    // 调用切换前的回调
    onChangePanelBefore && onChangePanelBefore(y, m - 1);
    // 根据当前面板类型更新显示的日期
    if (panel === PanelType.DATE) {
      Show(new Date(y, m - 1 + step, 1)); // 切换月份
    } else if (panel === PanelType.MONTH) {
      Show(new Date(y + step, m - 1, 1)); // 切换年份
    }
  };

  // 定义切换日期/月份视图的函数
  const changePanel = (p) => {
    // 调用切换前的回调
    onChangePanelTypeBefore && onChangePanelTypeBefore(p);
    // 更新面板类型状态
    Panel(p);
  };

  // 定义选择日期/月份的函数
  const setDate = (current) => {
    // 如果当前面板类型与 props.panel 不符（通常发生在从月份选择切换回日期选择），则切换面板
    if (panel !== props.panel) changePanel(props.panel);
    // 处理范围选择逻辑
    else if (range) {
      if (rangeClick) {
        // 如果已经点击了范围的起始日期
        // 获取范围内的所有日期，格式化并过滤掉不允许的日期
        const s = GetRangeDate(rangeClick, current)
          .map((v) =>
            FormatDate(v).slice(0, panel === PanelType.MONTH ? 7 : 10)
          )
          .filter((v) => allowDates(v));
        RangeClick(''); // 清空起始日期
        Selected(s); // 更新选中日期
        closeImmediately && onClose(s); // 如果设置了立即关闭，则关闭 Modal
      } else {
        // 如果是第一次点击范围
        RangeClick(current); // 记录起始日期
        Selected([current]); // 选中当前日期
      }
    }
    // 处理多选逻辑
    else if (multiple) {
      const index = selected.indexOf(current);
      if (index <= -1) selected.push(current); // 如果未选中，则添加
      else selected.splice(index, 1); // 如果已选中，则移除
      Selected([...selected]); // 更新选中日期（创建新数组触发更新）
      closeImmediately && onClose(selected); // 如果设置了立即关闭，则关闭 Modal
    }
    // 处理单选逻辑
    else {
      Selected([current]); // 选中当前日期
      closeImmediately && onClose([current]); // 如果设置了立即关闭，则关闭 Modal
    }
    // 更新日历显示的日期为当前选择的日期
    Show(new Date(current));
  };

  // 获取选中项的主题色
  const color = props.theme || Colors.Selected[theme];
  // 使用 useMemo 处理事件标记，优化性能
  const {
    event, // 格式化后的事件日期数组
    eventcolors, // 事件对应的颜色数组
  } = useMemo(() => {
    const e = [];
    const ec = [];
    // 遍历 props.event，格式化日期并提取颜色
    for (const v of props.event) {
      if (typeof v === 'string' || typeof v === 'number' || v instanceof Date) {
        e.push(FormatDate(new Date(v)));
        ec.push(color); // 默认使用主题色
      } else {
        e.push(FormatDate(new Date(v.date)));
        ec.push(v.color || color); // 使用指定的颜色或主题色
      }
    }
    return { event: e, eventcolors: ec };
  }, [props.event]);

  // 定义渲染日期视图的函数
  const renderDate = () => {
    // 计算每周的第一天是星期几（基于 firstDayOfWeek）
    const first = AllWeeks.indexOf(firstDayOfWeek) % 7;
    // 初始化当前月份的日期数据
    const CONTENT = InitAllDate(year, month, first, showAdjacentMonths);
    // 根据 firstDayOfWeek 重新排序星期标题
    const WEEKS = ResortWeek(language.weeks, first);

    // 如果需要显示周数，则计算并插入周数
    if (showWeek) {
      GiveArrayWeek(CONTENT, WEEKS, first, localeFirstDayOfYear);
    }

    return (
      <View>
        {/* 月份标题 */}
        <View>
          <Text style={style.subtitle}>{month + language.monthUnit}</Text>
        </View>
        {/* 星期标题 */}
        <View style={style.weeks}>
          {WEEKS.map((v) => (
            <Text key={v} style={style.linetitle}>
              {v}
            </Text>
          ))}
        </View>
        {/* 日期网格 */}
        <View>
          {CONTENT.map((value, index) => (
            <View key={value.join('.')} style={style.weeks}>
              {value.map((v, i) => {
                // 如果是周数或其他非日期数据，直接显示文本
                if (typeof v === 'number' || !v) {
                  return (
                    <View key={Key[index][showWeek ? i + 1 : i]}>
                      <Text style={[style.week, style.readonly]}>{v}</Text>
                    </View>
                  );
                }

                // 格式化当前日期为 'yyyy-mm-dd'
                const current = FormatDate(v);
                // 初始化日期单元格样式
                const currentStyle = [style.week];

                // 如果当前日期被选中，添加选中样式
                if (selected.includes(current)) {
                  currentStyle.push({ color: 'white', backgroundColor: color });
                }

                // 检查当前日期是否有事件标记
                const tip = event.indexOf(current);
                // 判断当前日期是否可选（在当前月份、在 min/max 范围内、通过 allowDates 校验）
                const flag =
                  month === v.getMonth() + 1 &&
                  (!parseInt(max, 10) || current <= max) &&
                  (!parseInt(min, 10) || current >= min) &&
                  allowDates(current);
                // 如果不可选，添加只读样式
                if (!flag) currentStyle.push(style.readonly);
                // 获取日期号数
                const showDate = v.getDate();

                // 返回可点击的日期单元格
                return (
                  <TouchableOpacity
                    onPress={() => flag && setDate(current)}
                    key={Key[index][showWeek ? i + 1 : i]}
                  >
                    <Text style={currentStyle}>{showDate}</Text>
                    {/* 如果有事件标记，显示小圆点 */}
                    {tip >= 0 && (
                      <Svg style={style.event} width="4" height="4">
                        <Circle cx="2" cy="2" r="2" fill={eventcolors[tip]} />
                      </Svg>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 定义渲染月份视图的函数
  const renderMonth = () => {
    // 月份数据布局
    const CONTENT = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ];
    return (
      <View style={{ marginBottom: 12, marginTop: 25 }}>
        {CONTENT.map((value) => (
          <View key={value.join('.')} style={style.weeks}>
            {value.map((v) => {
              // 格式化当前月份为 'yyyy-mm'
              const current = FormatDate(new Date(year, v - 1, 1)).slice(0, 7);
              // 初始化月份单元格样式
              const currentStyle = [style.month];

              // 如果当前月份被选中，添加选中样式
              if (selected.includes(current)) {
                currentStyle.push({ color: 'white', backgroundColor: color });
              }

              // 判断当前月份是否可选（在 min/max 范围内）
              const flag =
                (!parseInt(max, 10) || current <= max.slice(0, 7)) &&
                (!parseInt(min, 10) || current >= min.slice(0, 7));
              // 如果不可选，添加只读样式
              if (!flag) currentStyle.push(style.readonly);

              // 返回可点击的月份单元格
              return (
                <TouchableOpacity
                  onPress={() => flag && v && setDate(current)}
                  key={v}
                >
                  <Text style={currentStyle}>{v + language.monthUnit}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // 返回最终的 Modal 组件
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={() => onClose()}
    >
      {/* 遮罩层，点击可关闭 Modal (如果 persistent 为 true) */}
      {!hideOverlay && (
        <TouchableWithoutFeedback
          disabled={!persistent}
          onPress={() => onCancel && onCancel()}
        >
          <View
            style={{
              height: '100%',
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
        </TouchableWithoutFeedback>
      )}
      {/* 日期选择器主体内容 */}
      <View
        style={[
          style.main,
          { backgroundColor, height: fullscreen ? '100%' : 'auto' },
        ]}
      >
        {/* 标题 */}
        {title && (
          <View>
            <Text style={style.title}>{title}</Text>
          </View>
        )}
        {/* 年月切换区域 */}
        <View style={style.switch}>
          {/* 上一月/年按钮 */}
          <TouchableOpacity
            style={style.arrow}
            onPress={() => setShow(year, month, -1)}
          >
            {/* 左箭头 SVG */}
            <Svg width="6" height="12" viewBox="0 0 6 12" fill="none">
              <Path d="..." fill={Colors[theme].Arrow} />
            </Svg>
          </TouchableOpacity>
          {/* 中间年月显示，点击切换到月份/年份视图 */}
          <TouchableOpacity onPress={() => changePanel('month')}>
            <Text style={style.center}>
              {year}
              {panel === PanelType.DATE
                ? `-${month.toString().padStart(2, '0')}`
                : language.yearUnit}
            </Text>
          </TouchableOpacity>
          {/* 下一月/年按钮 */}
          <TouchableOpacity
            style={style.arrow}
            onPress={() => setShow(year, month, 1)}
          >
            {/* 右箭头 SVG */}
            <Svg width="6" height="12" viewBox="0 0 6 12" fill="none">
              <Path d="..." fill={Colors[theme].Arrow} />
            </Svg>
          </TouchableOpacity>
        </View>
        {/* 根据当前面板类型渲染日期或月份视图 */}
        {panel === PanelType.DATE ? renderDate() : renderMonth()}
        {/* 底部按钮区域 */}
        <View style={style.buttons}>
          {/* 取消按钮 */}
          <TouchableOpacity
            style={[
              style.button,
              { backgroundColor: buttonColor.cancel || 'rgba(0, 0, 0, 0.06)' },
            ]}
            disabled={readonly}
            onPress={() => onCancel && onCancel()}
          >
            <Text style={style.text}>{button.cancel || language.cancel}</Text>
          </TouchableOpacity>
          {/* 确定按钮 (仅在非立即关闭模式下显示) */}
          {!closeImmediately && (
            <TouchableOpacity
              style={[
                style.button,
                { backgroundColor: buttonColor.confirm || '#32BAC0' },
              ]}
              disabled={readonly}
              onPress={() => onClose()}
            >
              <Text style={[style.text, { color: 'white' }]}>
                {button.confirm || language.confirm}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// 设置组件的默认属性
YMDDatePicker.defaultProps = DefaultProp;
// 导出组件
export default YMDDatePicker;
```

## 属性 (Props)

| 属性名                 | 类型                                                                                  | 默认值       | 说明                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `visible`              | `boolean`                                                                             | `false`      | 控制日期选择器 Modal 的显示与隐藏。                                                                               |
| `date`                 | `Date` \| `number` \| `string` \| `Array<Date \| number \| string>`                   | `[]`         | 初始选中的日期。单选时为单个值，多选或范围选择时为数组。支持 `Date` 对象、时间戳（毫秒）、`yyyy-mm-dd` 等格式。   |
| `panel`                | `'date'` \| `'month'`                                                                 | `'date'`     | 初始显示的面板类型。                                                                                              |
| `range`                | `boolean`                                                                             | `false`      | 是否启用范围选择模式。启用后，`multiple` 会强制为 `false`。                                                       |
| `multiple`             | `boolean`                                                                             | `false`      | 是否启用多选模式。启用后，`range` 会强制为 `false`。                                                              |
| `closeImmediately`     | `boolean`                                                                             | `false`      | 选择日期后是否立即关闭 Modal 并触发 `onSelected`。`true` 时不显示确定按钮。                                       |
| `showAdjacentMonths`   | `boolean`                                                                             | `false`      | 是否在日期面板显示上个月和下个月的日期。                                                                          |
| `showWeek`             | `boolean`                                                                             | `false`      | 是否在日期面板显示周数。                                                                                          |
| `firstDayOfWeek`       | `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6`                                         | `0`          | 设置每周的第一天，`0` 代表星期日，`1` 代表星期一，以此类推。                                                      |
| `localeFirstDayOfYear` | `number`                                                                              | `4`          | 决定一年中第一周包含哪个日期。`0` 是星期日。对于 ISO 8601 标准，应为 `4` (星期四)。                               |
| `min`                  | `Date` \| `number` \| `string`                                                        | `undefined`  | 最小可选日期。                                                                                                    |
| `max`                  | `Date` \| `number` \| `string`                                                        | `undefined`  | 最大可选日期。                                                                                                    |
| `allowDates`           | `(date: string) => boolean`                                                           | `() => true` | 一个函数，用于判断某个日期是否可选。接收格式化后的日期字符串（`yyyy-mm-dd` 或 `yyyy-mm`），返回 `true` 表示可选。 |
| `event`                | `Array<Date \| number \| string \| {date: Date \| number \| string, color?: string}>` | `[]`         | 需要在日期下方显示标记的事件数组。可以直接传入日期，或传入包含 `date` 和可选 `color` 的对象。                     |
| `title`                | `string` \| `false`                                                                   | `undefined`  | Modal 的标题。默认为根据当前语言和面板类型自动选择（“选择日期”/“选择月份”）。设置为 `false` 可隐藏标题。          |
| `button`               | `{ confirm?: string, cancel?: string }`                                               | `{}`         | 自定义底部按钮的文本。                                                                                            |
| `buttonColor`          | `{ confirm?: string, cancel?: string }`                                               | `{}`         | 自定义底部按钮的背景颜色。                                                                                        |
| `theme`                | `string`                                                                              | `undefined`  | 自定义选中日期/月份的背景颜色和事件标记的默认颜色。默认为 `mhui-rn` 的主题色。                                    |
| `backgroundColor`      | `string`                                                                              | `undefined`  | 组件主体的背景颜色。默认为 `mhui-rn` 的主题背景色。                                                               |
| `fullscreen`           | `boolean`                                                                             | `false`      | 是否让 Modal 内容区域占据整个屏幕高度。                                                                           |
| `readonly`             | `boolean`                                                                             | `false`      | 是否为只读模式，只读模式下无法选择日期，按钮也会被禁用。                                                          |
| `hideOverlay`          | `boolean`                                                                             | `false`      | 是否隐藏 Modal 的遮罩层。                                                                                         |
| `persistent`           | `boolean`                                                                             | `true`       | 当 `hideOverlay` 为 `false` 时，点击遮罩层是否可以关闭 Modal 并触发 `onCancel`。                                  |
| `overlayColor`         | `string`                                                                              | `'#000'`     | 遮罩层的颜色。                                                                                                    |
| `overlayOpacity`       | `number`                                                                              | `0.4`        | 遮罩层的透明度。                                                                                                  |

## 事件 (Events)

| 事件名                    | 参数                                                      | 说明                                                                                                                                         |
| ------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `onSelected`              | `(selectedDate: Date \| string \| Array<Date \| string>)` | 当用户完成日期选择时触发（点击确定按钮或在 `closeImmediately` 模式下选择日期后）。参数根据选择模式（单选/多选/范围）返回相应格式的选中日期。 |
| `onCancel`                | `()`                                                      | 当用户点击取消按钮或点击遮罩层（如果 `persistent` 为 `true`）关闭 Modal 时触发。                                                             |
| `onChangePanelBefore`     | `(year: number, monthIndex: number)`                      | 在切换月份（日期面板）或年份（月份面板）之前触发。参数为切换前的年份和月份索引（0-11）。                                                     |
| `onChangePanelTypeBefore` | `(panelType: 'date' \| 'month')`                          | 在切换日期面板和月份面板之前触发。参数为即将切换到的面板类型。                                                                               |

## 使用示例

```javascript
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import YMDDatePicker from 'mhui-rn/dist/components/ymdDatePicker'; // 假设路径正确

const MyComponent = () => {
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelect = (date) => {
    console.log('Selected Date:', date);
    setSelectedDate(date);
    setVisible(false); // 关闭选择器
  };

  return (
    <View>
      <Button title="选择日期" onPress={() => setVisible(true)} />
      <Text>当前选择: {selectedDate ? selectedDate.toString() : '未选择'}</Text>

      <YMDDatePicker
        visible={visible}
        date={selectedDate} // 将当前选中的日期传入
        onSelected={handleSelect} // 处理选择结果
        onCancel={() => setVisible(false)} // 处理取消操作
        // --- 其他可选配置 ---
        // range={true} // 启用范围选择
        // multiple={true} // 启用多选
        // min="2023-01-01" // 设置最小可选日期
        // max="2024-12-31" // 设置最大可选日期
        // showAdjacentMonths={true} // 显示相邻月份日期
        // firstDayOfWeek={1} // 设置周一为每周第一天
        // event={['2023-10-24', { date: '2023-11-11', color: 'red' }]} // 添加事件标记
        // title="请选择您的生日" // 自定义标题
      />
    </View>
  );
};

export default MyComponent;
```
