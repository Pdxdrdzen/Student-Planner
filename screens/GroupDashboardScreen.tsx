import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

const EVENTS: Record<string, { id: string; title: string; color: string; priority?: boolean }[]> = {
  '2026-03-25': [{ id: '1', title: 'Spotkanie projektowe', color: '#f4a7b9', priority: true }],
  '2026-03-28': [{ id: '2', title: 'Oddanie sprintu', color: '#a7c4f4' }],
};

function SimpleCalendar({ selectedDay, onSelectDay }: { selectedDay: string; onSelectDay: (d: string) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });

  const blanks = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View style={cal.wrapper}>
      <Text style={cal.monthTitle}>{monthName}</Text>
      <View style={cal.row}>
        {['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(d => (
          <Text key={d} style={cal.dayLabel}>{d}</Text>
        ))}
      </View>
      <View style={cal.grid}>
        {blanks.map((_, i) => <View key={`b${i}`} style={cal.cell} />)}
        {days.map(day => {
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const events = EVENTS[key] || [];
          const isSelected = selectedDay === key;
          const isToday = day === today.getDate();
          return (
            <TouchableOpacity
              key={key}
              style={[cal.cell, isSelected && cal.selected, isToday && cal.today]}
              onPress={() => onSelectDay(key)}
            >
              <Text style={[cal.dayNum, isSelected && cal.selectedText, isToday && cal.todayText]}>
                {day}
              </Text>
              {events.slice(0, 2).map((event, i) => (
                <View key={i} style={[cal.eventChip, { backgroundColor: event.color }]}>
                  <Text style={cal.eventChipText} numberOfLines={1}>
                    {event.priority ? '! ' : ''}{event.title}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function GroupDashboardScreen() {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [chatOpen, setChatOpen] = useState(false);

  const selectedEvents = EVENTS[selectedDay] || [];

  const lastMessages = [
    { id: '1', author: 'Klaudia', text: 'Wyrobimy się ze sprintem?' },
    { id: '2', author: 'Przemek', text: 'Ja ogarnę ekran logowania' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.groupName}>Grupa projektowa</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kalendarz / wydarzenia</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Zobacz wszystko</Text>
            </TouchableOpacity>
          </View>

          <SimpleCalendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />

          <View style={{ marginTop: 10 }}>
            {selectedEvents.length === 0 ? (
              <Text style={{ color: '#b0a090', fontSize: 13, marginTop: 6 }}>Brak wydarzeń w tym dniu</Text>
            ) : (
              selectedEvents.map(event => (
                <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.color }]}>
                  <Text style={styles.eventTitle}>
                    {event.priority ? '! ' : ''}{event.title}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {chatOpen && (
        <View style={styles.chatPanel}>
          <Text style={styles.chatPanelTitle}>Czat grupy</Text>
          {lastMessages.map((msg) => (
            <View key={msg.id} style={styles.messageItem}>
              <Text style={styles.messageAuthor}>{msg.author}</Text>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.chatFab} onPress={() => setChatOpen(!chatOpen)}>
        <Text style={styles.chatFabIcon}>💬</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addEventBar}>
        <Text style={styles.addEventText}>+ Dodaj wydarzenie</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const cal = StyleSheet.create({
  wrapper: { backgroundColor: '#f5f0e8', borderRadius: 12, padding: 12, marginTop: 8 },
  monthTitle: { textAlign: 'center', fontWeight: '700', fontSize: 16, marginBottom: 8, color: '#3a3a3a' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  dayLabel: { width: 44, textAlign: 'center', fontSize: 13, color: '#a0978a' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', alignItems: 'center', paddingVertical: 6, minHeight: 58 },
  dayNum: { fontSize: 15, color: '#2a2a2a', marginBottom: 2 },
  selected: { backgroundColor: '#c8b9a2', borderRadius: 8 },
  selectedText: { color: '#fff', fontWeight: '700' },
  today: { borderWidth: 1, borderColor: '#c8b9a2', borderRadius: 8 },
  todayText: { color: '#8a7560', fontWeight: '700' },
  eventChip: {
    marginTop: 2,
    width: '88%',
    height: 28,
    borderRadius: 5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventChipText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fdf8f2' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  groupName: { fontSize: 22, fontWeight: '700', marginBottom: 14, color: '#2a2a2a' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2a2a2a' },
  sectionLink: { fontSize: 13, color: '#a0897a' },
  eventCard: { backgroundColor: '#fdf0e0', borderLeftWidth: 4, borderRadius: 8, padding: 10, marginBottom: 8 },
  eventTitle: { fontSize: 15, fontWeight: '500', color: '#2a2a2a' },
  chatPanel: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    width: 260,
    backgroundColor: '#fdf8f2',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ede8e0',
  },
  chatPanelTitle: { fontWeight: '700', fontSize: 15, marginBottom: 8, color: '#2a2a2a' },
  messageItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#ede8e0' },
  messageAuthor: { fontWeight: '600', color: '#3a3a3a', fontSize: 13 },
  messageText: { color: '#6a6a6a', fontSize: 13 },
  chatFab: {
    position: 'absolute',
    bottom: 64,
    left: 20,
    backgroundColor: '#c8b9a2',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  chatFabIcon: { fontSize: 22 },
  addEventBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#c8b9a2',
    paddingVertical: 16,
    alignItems: 'center',
  },
  addEventText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
