import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

/* ------------------- 超轻量日期工具 ------------------- */
const MONTH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const addMonths    = (d: Date, n = 1) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
const subMonths    = (d: Date, n = 1) => addMonths(d, -n);
const startOfMonth = (d: Date)        => new Date(d.getFullYear(), d.getMonth(), 1);

/** 仅覆盖本文件用到的三种格式 */
function fmt(d: Date, p: string) {
  return p
    .replace('MMMM', MONTH[d.getMonth()])
    .replace('MMM',  MONTH[d.getMonth()].slice(0, 3))
    .replace('yyyy', `${d.getFullYear()}`)
    .replace('MM',   `${d.getMonth() + 1}`.padStart(2, '0'))
    .replace('dd',   `${d.getDate()}`.padStart(2, '0'))
    .replace('eee',  WEEK[d.getDay()]);
}

/** 把整月切成若干周：[[d1…d7], [d8…d14], …]，日期不足处用 null 占位 */
function monthWeeks(date: Date) {
  const leadNulls   = Array(startOfMonth(date).getDay()).fill(null);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const allDays: (Date | null)[] = [
    ...leadNulls,
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(date.getFullYear(), date.getMonth(), i + 1)
    ),
  ];
  while (allDays.length % 7) allDays.push(null); // 尾部补齐
  const res: (Date | null)[][] = [];
  for (let i = 0; i < allDays.length; i += 7) res.push(allDays.slice(i, i + 7));
  return res;
}

/* --------------------- 组件主体 --------------------- */
export default function CalendarScreen() {
  const [month, setMonth]     = useState(new Date());
  const [selected, setSelect] = useState<Date | null>(null);
  const { width }             = useWindowDimensions();

  const cellMargin  = 2;  // 单元格外边距
  const rowPadding  = 4;  // 整行左右留白
  const colWidth    = (width - rowPadding * 2 - cellMargin * 14) / 7; // 7 列正好占满

  const weeks = useMemo(() => monthWeeks(month), [month]);

  return (
    <View style={styles.root}>
      {/* 顶栏：月份切换 */}
      <View style={styles.header}>
        <Arrow text="‹" onPress={() => setMonth(m => subMonths(m))} />
        <Text style={styles.headerTitle}>{fmt(month, 'MMMM yyyy')}</Text>
        <Arrow text="›" onPress={() => setMonth(m => addMonths(m))} />
      </View>

      {/* 星期标题 */}
      <View style={[styles.weekRow, { paddingHorizontal: rowPadding }]}>
        {WEEK.map(w => (
          <Text key={w} style={[styles.weekTxt, { width: colWidth }]}>{w}</Text>
        ))}
      </View>

      {/* 月历网格 */}
      <ScrollView style={{ flex: 1 }}>
        {weeks.map((wk, wi) => (
          <View key={wi} style={[styles.weekRow, { paddingHorizontal: rowPadding }]}>
            {wk.map((d, di) => {
              const today   = d && fmt(d, 'yyyy-MM-dd') === fmt(new Date(), 'yyyy-MM-dd');
              const chosen  = d && selected && fmt(d, 'yyyy-MM-dd') === fmt(selected, 'yyyy-MM-dd');
              return (
                <TouchableOpacity
                  key={di}
                  disabled={!d}
                  onPress={() => d && setSelect(d)}
                  style={[
                    styles.dayCell,
                    {
                      width:  colWidth,
                      height: colWidth,          // 保证正方形
                      margin: cellMargin,
                      backgroundColor: chosen ? '#0ea5e9' : 'transparent',
                    },
                  ]}
                >
                  {d && (
                    <Text style={{
                      color: chosen ? '#fff' : today ? '#d97706' : '#000',
                      fontWeight: today || chosen ? '600' : '400',
                    }}>
                      {d.getDate()}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* 选中日期 / 事件栏 */}
      <View style={styles.eventBar}>
        <Text style={styles.eventTitle}>
          {selected ? `Selected: ${fmt(selected, 'eee MMM dd yyyy')}` : 'No date selected'}
        </Text>
        <Text style={{ color: '#6b7280' }}>No events yet.</Text>
      </View>
    </View>
  );
}

/* --------------------- 小组件 & 样式 --------------------- */
const Arrow = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.arrow}>
    <Text style={styles.arrowTxt}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#f4511e',
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 12,
    paddingVertical:   10,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  arrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  arrowTxt: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: -2 },

  weekRow: { flexDirection: 'row' },
  weekTxt: { textAlign: 'center', fontSize: 12, fontWeight: '600' },

  dayCell: { alignItems: 'center', justifyContent: 'center', borderRadius: 6 },

  eventBar:  { padding: 12, borderTopWidth: 1, borderColor: '#e5e7eb' },
  eventTitle:{ fontWeight: '600', marginBottom: 4 },
});
