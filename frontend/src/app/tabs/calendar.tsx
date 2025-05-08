import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { getTodosByDate } from '../../api/todo';
import { TaskEvent } from '../../api/types';

const MONTH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const addMonths = (d: Date, n = 1) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
const subMonths = (d: Date, n = 1) => addMonths(d, -n);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

function fmt(d: Date, p: string) {
  return p
    .replace('MMMM', MONTH[d.getMonth()])
    .replace('MMM', MONTH[d.getMonth()].slice(0, 3))
    .replace('yyyy', `${d.getFullYear()}`)
    .replace('MM', `${d.getMonth() + 1}`.padStart(2, '0'))
    .replace('dd', `${d.getDate()}`.padStart(2, '0'))
    .replace('eee', WEEK[d.getDay()]);
}

function monthWeeks(date: Date) {
  const leadNulls = Array(startOfMonth(date).getDay()).fill(null);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const allDays = [
    ...leadNulls,
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(date.getFullYear(), date.getMonth(), i + 1)
    ),
  ];
  while (allDays.length % 7) allDays.push(null);
  const res = [];
  for (let i = 0; i < allDays.length; i += 7) res.push(allDays.slice(i, i + 7));
  return res;
}

const MINT = '#34d399'; // Mint/teal color for highlights
const GRAY = '#d1d5db'; // Light gray for out-of-month days
const BLACK = '#222';
const MUTED = '#9ca3af';

const CAL_FONT_SIZE = 40;
const DATE_FONT_SIZE = 24;
const CAL_FONT_WEIGHT = 'bold';

export default function CalendarScreen() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelect] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daysWithTasks, setDaysWithTasks] = useState<Set<string>>(new Set());
  const { width } = useWindowDimensions();

  const cellMargin = 1;
  const rowPadding = 2;
  const colWidth = (width - rowPadding * 2 - cellMargin * 14) / 7;

  const weeks = useMemo(() => monthWeeks(month), [month]);

  const handleDatePress = (date: Date) => {
    setSelect(date);
    setModalVisible(true);
  };

  useEffect(() => {
    if (!selected) return;

    const dateStr = fmt(selected, 'yyyy-MM-dd');
    setLoading(true);
    setEvents(null);
    setError(null);

    getTodosByDate(dateStr)
      .then(data => {
        const formatted = data.map(ev => {
          const people = ev.participants?.length ? `(${ev.participants.join(', ')})` : '';
          const time = ev.time ? ` @ ${ev.time}` : '';
          return `${ev.task}${people}${time}`;
        });
        setEvents(formatted);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
        setEvents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selected]);

  // Load tasks for the current month
  useEffect(() => {
    const loadMonthTasks = async () => {
      const days = new Set<string>();
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      
      console.log('Loading tasks for month:', fmt(month, 'yyyy-MM'));
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = fmt(date, 'yyyy-MM-dd');
        const tasks = await getTodosByDate(dateStr);
        console.log(`Date ${dateStr} has ${tasks.length} tasks:`, tasks);
        if (tasks.length > 0) {
          days.add(dateStr);
        }
      }
      console.log('Days with tasks:', Array.from(days));
      setDaysWithTasks(days);
    };

    loadMonthTasks();
  }, [month]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMonth(m => subMonths(m))}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {fmt(month, 'MMMM yyyy').toUpperCase()}
          </Text>
          <TouchableOpacity onPress={() => setMonth(m => addMonths(m))}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.weekRow, { paddingHorizontal: rowPadding, marginTop: 8 }]}>
        {WEEK.map(w => (
          <Text key={w} style={[styles.weekTxt, { width: colWidth, color: '#6a11cb', fontWeight: 'bold' }]}>{w.toUpperCase()}</Text>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.calendarContainer}>
        {weeks.map((wk, wi) => (
          <View key={wi} style={[styles.weekRow, { paddingHorizontal: rowPadding }]}>
            {wk.map((d, di) => {
              const isToday = d && fmt(d, 'yyyy-MM-dd') === fmt(new Date(), 'yyyy-MM-dd');
              const isChosen = d && selected && fmt(d, 'yyyy-MM-dd') === fmt(selected, 'yyyy-MM-dd');
              const inMonth = d && d.getMonth() === month.getMonth();
              const hasTasks = d && daysWithTasks.has(fmt(d, 'yyyy-MM-dd'));
              return (
                <TouchableOpacity
                  key={di}
                  disabled={!d}
                  onPress={() => d && handleDatePress(d)}
                  style={[
                    styles.dayCell,
                    {
                      width: colWidth,
                      height: colWidth * 0.5,
                      margin: cellMargin,
                      backgroundColor: 'transparent',
                      borderRadius: colWidth * 0.3,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  {d && (
                    isChosen ? (
                      <View style={[
                        styles.eventFilledCircle,
                        {
                          backgroundColor: 'transparent',
                          borderWidth: 2,
                          borderColor: '#a78bfa',
                        },
                      ]}>
                        <Text style={{
                          color: '#a78bfa',
                          fontWeight: isToday ? CAL_FONT_WEIGHT : '400',
                          fontSize: DATE_FONT_SIZE,
                          textAlign: 'center',
                        }}>{d.getDate()}</Text>
                      </View>
                    ) : hasTasks ? (
                      <View style={styles.eventFilledCircle}>
                        <Text style={{
                          color: '#fff',
                          fontWeight: isToday ? CAL_FONT_WEIGHT : '400',
                          fontSize: DATE_FONT_SIZE,
                          textAlign: 'center',
                        }}>{d.getDate()}</Text>
                      </View>
                    ) : (
                      <Text style={{
                        color: inMonth ? BLACK : GRAY,
                        fontWeight: isToday ? CAL_FONT_WEIGHT : '400',
                        fontSize: DATE_FONT_SIZE,
                        textAlign: 'center',
                      }}>{d.getDate()}</Text>
                    )
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%', minHeight: 200 }}>
          {loading ? (
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Loading...</Text>
          ) : error ? (
            <Text style={{ color: '#ef4444', fontSize: 24, fontWeight: 'bold' }}>{error}</Text>
          ) : events && events.length > 0 ? (
            events.map((e, i) => <Text key={i} style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>• {e}</Text>)
          ) : (
            <Text style={{ color: '#6b7280', fontSize: 24, fontWeight: 'bold' }}>No events for this day.</Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: CAL_FONT_SIZE,
    fontWeight: CAL_FONT_WEIGHT,
    color: '#6a11cb',
    letterSpacing: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  arrowText: {
    fontSize: CAL_FONT_SIZE,
    color: '#6a11cb',
    fontWeight: CAL_FONT_WEIGHT,
    paddingHorizontal: 8,
  },
  calendarContainer: {
    flex: 1,
    paddingTop: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekTxt: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: CAL_FONT_WEIGHT,
    marginBottom: 16,
    color: '#6a11cb',
  },
  dayCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventFilledCircle: {
    backgroundColor: '#a78bfa',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: CAL_FONT_SIZE * 1.5 + 20,
    minHeight: CAL_FONT_SIZE * 1.5 + 20,
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 2,
    marginBottom: 8,
  },
});
