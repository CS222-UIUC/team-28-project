import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import rawMock from '../../assets/mock_data.json';
const mockData = rawMock as Record<string, TaskEvent[]>;
type TaskEvent = {
  task: string;
  participants: string[];
  date: string;
  time: string | null;
  end_time: string | null;
  locations: string[];
};

/** Use the following code for FastAPI connection
 
 * import { getTodosByDate } from '../../api/todo';

useEffect(() => {
  if (!selected) return;

  const dateStr = fmt(selected, 'yyyy-MM-dd');
  setLoading(true);       // Start loading state
  setEvents(null);        // Clear previous events

  // Fetch todo events for the selected date
  getTodosByDate(dateStr)
    .then(data => {
      // Format each TaskEvent object into a user-friendly string
      const formatted = data.map(ev => {
        const time = ev.time || 'unspecified';
        const people = ev.participants.join(', ') || 'nobody';
        const place = ev.locations.length > 0 ? ` at ${ev.locations.join(', ')}` : '';
        return `${ev.task} with ${people} at ${time}${place}`;
      });
      setEvents(formatted); // Update state with formatted event strings
    })
    .catch(() => setEvents([])) // On error, show no events
    .finally(() => setLoading(false)); // End loading state
}, [selected]); // Run this effect whenever a new date is selected

 */



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

export default function CalendarScreen() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelect] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const cellMargin = 2;
  const rowPadding = 4;
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

    setTimeout(() => {
      const rawEvents = mockData[dateStr];

      if (rawEvents && Array.isArray(rawEvents)) {
        const formatted = rawEvents.map(ev => {
          const time = ev.time || 'unspecified';
          const people = ev.participants?.join(', ') || 'nobody';
          const place = ev.locations?.length ? ` at ${ev.locations.join(', ')}` : '';
          return `${ev.task} with ${people} at ${time}${place}`;
        });
        setEvents(formatted);
      } else {
        setEvents([]);
      }

      setLoading(false);
    }, 300); // 模拟网络延迟
  }, [selected]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Arrow text="‹" onPress={() => setMonth(m => subMonths(m))} />
        <Text style={styles.headerTitle}>{fmt(month, 'MMMM yyyy')}</Text>
        <Arrow text="›" onPress={() => setMonth(m => addMonths(m))} />
      </View>

      <View style={[styles.weekRow, { paddingHorizontal: rowPadding }]}>
        {WEEK.map(w => (
          <Text key={w} style={[styles.weekTxt, { width: colWidth }]}>{w}</Text>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
        {weeks.map((wk, wi) => (
          <View key={wi} style={[styles.weekRow, { paddingHorizontal: rowPadding }]}>
            {wk.map((d, di) => {
              const today = d && fmt(d, 'yyyy-MM-dd') === fmt(new Date(), 'yyyy-MM-dd');
              const chosen = d && selected && fmt(d, 'yyyy-MM-dd') === fmt(selected, 'yyyy-MM-dd');
              return (
                <TouchableOpacity
                  key={di}
                  disabled={!d}
                  onPress={() => d && handleDatePress(d)}
                  style={[
                    styles.dayCell,
                    {
                      width: colWidth,
                      height: colWidth,
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

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            {selected ? `🗓 ${fmt(selected, 'eee MMM dd yyyy')}` : ''}
          </Text>
          {loading ? (
            <Text>Loading...</Text>
          ) : events && events.length > 0 ? (
            events.map((e, i) => <Text key={i}>• {e}</Text>)
          ) : (
            <Text style={{ color: '#6b7280' }}>No events for this day.</Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const Arrow = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.arrow}>
    <Text style={styles.arrowTxt}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
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
});
