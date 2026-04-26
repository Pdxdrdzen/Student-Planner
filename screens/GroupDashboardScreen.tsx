import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import AnimatedBackground from '../components/AnimatedBackground';

type EventType = 'normal' | 'priority';

type EventItem = {
  id: string;
  title: string;
  type: EventType;
  time?: string;
};

type ChatMessage = {
  id: string;
  author: string;
  text: string;
};

const INITIAL_EVENTS: Record<string, EventItem[]> = {
  '2026-04-13': [
    { id: '1', title: 'Spotkanie projektowe', type: 'priority', time: '18:00' },
    { id: '2', title: 'Przegląd sprintu', type: 'normal', time: '20:00' },
  ],
  '2026-04-15': [
    { id: '3', title: 'Oddanie makiet', type: 'priority', time: '23:59' },
  ],
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', author: 'Klaudia', text: 'Wyrobimy się ze sprintem?' },
  { id: '2', author: 'Przemek', text: 'Ja ogarnę ekran logowania.' },
  { id: '3', author: 'Ania', text: 'Mogę jutro dokończyć widok wydarzeń.' },
];

function getEventColors(type: EventType) {
  if (type === 'priority') {
    return {
      solid: '#FF5A6B',
      soft: '#FF5A6B22',
      border: '#FF5A6B55',
      text: '#FF9BA4',
      stickyText: '#FFF4F5',
      tape: '#FFD0D5',
    };
  }

  return {
    solid: '#4DA3FF',
    soft: '#4DA3FF22',
    border: '#4DA3FF55',
    text: '#9FD0FF',
    stickyText: '#F4FAFF',
    tape: '#C9E6FF',
  };
}

function sortEvents(events: EventItem[]) {
  return [...events].sort((a, b) => {
    if (a.type === 'priority' && b.type !== 'priority') return -1;
    if (a.type !== 'priority' && b.type === 'priority') return 1;
    return 0;
  });
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatSelectedDate(dateKey: string) {
  const date = new Date(dateKey);
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function SimpleCalendar({
                          selectedDay,
                          onSelectDay,
                          eventsMap,
                        }: {
  selectedDay: string;
  onSelectDay: (d: string) => void;
  eventsMap: Record<string, EventItem[]>;
}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDay = today.getDate();

  const monthName = today.toLocaleString('pl-PL', {
    month: 'long',
    year: 'numeric',
  });

  const cells = useMemo(() => getMonthMatrix(year, month), [year, month]);

  return (
      <View style={calendarStyles.wrapper}>
        <View style={calendarStyles.header}>
          <Text style={calendarStyles.monthTitle}>{monthName}</Text>
          <View style={calendarStyles.monthBadge}>
            <Text style={calendarStyles.monthBadgeText}>Widok miesiąca</Text>
          </View>
        </View>

        <View style={calendarStyles.row}>
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
              <Text key={d} style={calendarStyles.dayLabel}>
                {d}
              </Text>
          ))}
        </View>

        <View style={calendarStyles.grid}>
          {cells.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} style={calendarStyles.cell} />;
            }

            const key = formatDateKey(year, month, day);
            const rawEvents = eventsMap[key] || [];
            const events = sortEvents(rawEvents).slice(0, 2);
            const isSelected = selectedDay === key;
            const isToday = day === todayDay;

            return (
                <TouchableOpacity
                    key={key}
                    style={[
                      calendarStyles.cell,
                      isSelected && calendarStyles.selected,
                      isToday && !isSelected && calendarStyles.today,
                    ]}
                    onPress={() => onSelectDay(key)}
                    activeOpacity={0.85}
                >
                  <Text
                      style={[
                        calendarStyles.dayNum,
                        isSelected && calendarStyles.selectedText,
                        isToday && !isSelected && calendarStyles.todayText,
                      ]}
                  >
                    {day}
                  </Text>

                  <View style={calendarStyles.stickyContainer}>
                    {events.map((event, eventIndex) => {
                      const colors = getEventColors(event.type);
                      const isPriority = event.type === 'priority';

                      return (
                          <View
                              key={event.id}
                              style={[
                                calendarStyles.eventSticky,
                                {
                                  backgroundColor: colors.solid,
                                  borderColor: colors.border,
                                  top: eventIndex * 14,
                                  zIndex: 20 - eventIndex,
                                  transform: [
                                    { rotate: eventIndex === 0 ? '-2deg' : '2deg' },
                                  ],
                                },
                                eventIndex === 0
                                    ? calendarStyles.stickyTop
                                    : calendarStyles.stickyBottom,
                              ]}
                          >
                            <View
                                style={[
                                  calendarStyles.stickyTape,
                                  { backgroundColor: colors.tape },
                                ]}
                            />
                            <Text
                                numberOfLines={1}
                                style={[
                                  calendarStyles.eventStickyText,
                                  { color: colors.stickyText },
                                ]}
                            >
                              {isPriority ? '! ' : ''}
                              {event.title}
                            </Text>
                          </View>
                      );
                    })}
                  </View>
                </TouchableOpacity>
            );
          })}
        </View>
      </View>
  );
}

export default function GroupDashboardScreen() {
  const today = new Date();
  const todayKey = formatDateKey(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
  );

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [chatOpen, setChatOpen] = useState(false);

  const [eventsMap, setEventsMap] = useState<Record<string, EventItem[]>>(INITIAL_EVENTS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<EventType>('normal');

  const [chatInput, setChatInput] = useState('');

  const selectedEvents = sortEvents(eventsMap[selectedDay] || []);

  const openAddModal = () => {
    setEditingEventId(null);
    setNewTitle('');
    setNewTime('');
    setNewType('normal');
    setAddModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEventId(event.id);
    setNewTitle(event.title);
    setNewTime(event.time || '');
    setNewType(event.type);
    setAddModalOpen(true);
  };

  const handleSaveEvent = () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    if (editingEventId) {
      setEventsMap((prev) => {
        const current = prev[selectedDay] || [];
        const updated = current.map((event) =>
            event.id === editingEventId
                ? {
                  ...event,
                  title: trimmedTitle,
                  time: newTime.trim() || undefined,
                  type: newType,
                }
                : event,
        );

        return {
          ...prev,
          [selectedDay]: sortEvents(updated),
        };
      });
    } else {
      const newEvent: EventItem = {
        id: Date.now().toString(),
        title: trimmedTitle,
        time: newTime.trim() || undefined,
        type: newType,
      };

      setEventsMap((prev) => {
        const current = prev[selectedDay] || [];
        return {
          ...prev,
          [selectedDay]: sortEvents([...current, newEvent]),
        };
      });
    }

    setEditingEventId(null);
    setNewTitle('');
    setNewTime('');
    setNewType('normal');
    setAddModalOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventsMap((prev) => {
      const current = prev[selectedDay] || [];
      const filtered = current.filter((event) => event.id !== eventId);

      return {
        ...prev,
        [selectedDay]: filtered,
      };
    });
  };

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      author: 'Ty',
      text: trimmed,
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatInput('');
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
        <AnimatedBackground />

        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlock}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✦ Panel grupy</Text>
            </View>

            <Text style={styles.groupName}>Grupa projektowa</Text>
            <Text style={styles.groupSubtitle}>
              Zarządzaj terminami, wydarzeniami i kontaktem zespołu w jednym miejscu.
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kalendarz / wydarzenia</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.sectionLink}>Zobacz wszystko</Text>
            </TouchableOpacity>
          </View>

          <SimpleCalendar
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              eventsMap={eventsMap}
          />

          <View style={styles.selectedDayCard}>
            <Text style={styles.selectedDayLabel}>Wybrany dzień</Text>
            <Text style={styles.selectedDayValue}>
              {formatSelectedDate(selectedDay)}
            </Text>
          </View>

          <View style={styles.eventsSection}>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionTitle}>Wydarzenia tego dnia</Text>
              <Text style={styles.subsectionMeta}>
                {selectedEvents.length} {selectedEvents.length === 1 ? 'pozycja' : selectedEvents.length < 5 ? 'pozycje' : 'pozycji'}
              </Text>
            </View>

            {selectedEvents.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Brak wydarzeń</Text>
                  <Text style={styles.emptyDescription}>
                    Ten dzień jest jeszcze pusty. Dodaj nowe wydarzenie z dolnego przycisku.
                  </Text>
                </View>
            ) : (
                selectedEvents.map((event) => {
                  const colors = getEventColors(event.type);

                  return (
                      <View key={event.id} style={styles.eventCard}>
                        <View
                            style={[
                              styles.eventDot,
                              { backgroundColor: colors.solid },
                            ]}
                        />
                        <View style={styles.eventContent}>
                          <View style={styles.eventTopRow}>
                            <Text style={styles.eventTitle}>
                              {event.type === 'priority' ? '! ' : ''}
                              {event.title}
                            </Text>

                            <View
                                style={[
                                  styles.eventTypeBadge,
                                  {
                                    backgroundColor: colors.soft,
                                    borderColor: colors.border,
                                  },
                                ]}
                            >
                              <Text
                                  style={[
                                    styles.eventTypeText,
                                    { color: colors.text },
                                  ]}
                              >
                                {event.type === 'priority' ? 'Priorytet' : 'Zwykłe'}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.eventMeta}>
                            {event.time ? `Godzina: ${event.time}` : 'Bez przypisanej godziny'}
                          </Text>

                          <View style={styles.eventActionsRow}>
                            <TouchableOpacity
                                style={styles.eventActionButton}
                                onPress={() => openEditModal(event)}
                                activeOpacity={0.85}
                            >
                              <Text style={styles.eventActionText}>Edytuj</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.eventActionButton, styles.eventActionDelete]}
                                onPress={() => handleDeleteEvent(event.id)}
                                activeOpacity={0.85}
                            >
                              <Text style={[styles.eventActionText, styles.eventActionDeleteText]}>
                                Usuń
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                  );
                })
            )}
          </View>
        </ScrollView>

        {chatOpen && (
            <View style={styles.chatPanel}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatPanelTitle}>Czat grupy</Text>
                <TouchableOpacity
                    onPress={() => setChatOpen(false)}
                    activeOpacity={0.8}
                >
                  <Text style={styles.chatClose}>Zamknij</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                  style={styles.chatMessagesList}
                  showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => (
                    <View key={msg.id} style={styles.messageItem}>
                      <Text style={styles.messageAuthor}>{msg.author}</Text>
                      <Text style={styles.messageText}>{msg.text}</Text>
                    </View>
                ))}
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                    value={chatInput}
                    onChangeText={setChatInput}
                    placeholder="Napisz wiadomość..."
                    placeholderTextColor="#666"
                    style={styles.chatInput}
                />
                <TouchableOpacity
                    style={styles.chatSendButton}
                    onPress={handleSendMessage}
                    activeOpacity={0.9}
                >
                  <Text style={styles.chatSendButtonText}>Wyślij</Text>
                </TouchableOpacity>
              </View>
            </View>
        )}

        <TouchableOpacity
            style={styles.chatFab}
            onPress={() => setChatOpen((prev) => !prev)}
            activeOpacity={0.85}
        >
          <Text style={styles.chatFabIcon}>💬</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.addEventBar}
            activeOpacity={0.9}
            onPress={openAddModal}
        >
          <Text style={styles.addEventText}>+ Dodaj wydarzenie</Text>
        </TouchableOpacity>

        <Modal
            visible={addModalOpen}
            animationType="slide"
            transparent
            onRequestClose={() => setAddModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEventId ? 'Edytuj wydarzenie' : 'Dodaj wydarzenie'}
                </Text>
                <TouchableOpacity
                    onPress={() => setAddModalOpen(false)}
                    activeOpacity={0.8}
                >
                  <Text style={styles.modalClose}>Zamknij</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Tytuł wydarzenia</Text>
              <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Np. Konsultacje zespołu"
                  placeholderTextColor="#666"
                  style={styles.input}
              />

              <Text style={styles.inputLabel}>Godzina</Text>
              <TextInput
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="Np. 18:30"
                  placeholderTextColor="#666"
                  style={styles.input}
              />

              <Text style={styles.inputLabel}>Typ wydarzenia</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newType === 'normal' && styles.typeButtonActiveBlue,
                    ]}
                    onPress={() => setNewType('normal')}
                    activeOpacity={0.85}
                >
                  <Text
                      style={[
                        styles.typeButtonText,
                        newType === 'normal' && styles.typeButtonTextActive,
                      ]}
                  >
                    Niebieskie zwykłe
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newType === 'priority' && styles.typeButtonActiveRed,
                    ]}
                    onPress={() => setNewType('priority')}
                    activeOpacity={0.85}
                >
                  <Text
                      style={[
                        styles.typeButtonText,
                        newType === 'priority' && styles.typeButtonTextActive,
                      ]}
                  >
                    Czerwone priorytetowe
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSaveEvent}
                  activeOpacity={0.9}
              >
                <Text style={styles.submitButtonText}>
                  {editingEventId ? 'Zapisz zmiany' : 'Zapisz wydarzenie'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
}

const calendarStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#161616',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 14,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitle: {
    color: '#eee',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  monthBadge: {
    backgroundColor: '#6C63FF1A',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#6C63FF33',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  monthBadgeText: {
    color: '#9D97FF',
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    minHeight: 92,
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
  },
  dayNum: {
    fontSize: 15,
    color: '#ddd',
    marginBottom: 6,
    fontWeight: '500',
  },
  selected: {
    backgroundColor: '#6C63FF22',
    borderWidth: 1,
    borderColor: '#6C63FF44',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  today: {
    borderWidth: 1,
    borderColor: '#343434',
    backgroundColor: '#191919',
  },
  todayText: {
    color: '#9D97FF',
    fontWeight: '700',
  },
  stickyContainer: {
    width: '100%',
    height: 52,
    position: 'relative',
    marginTop: 4,
  },
  eventSticky: {
    position: 'absolute',
    minHeight: 22,
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingTop: 7,
    paddingBottom: 3,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  stickyTop: {
    left: 2,
    right: 6,
  },
  stickyBottom: {
    left: 7,
    right: 2,
  },
  stickyTape: {
    position: 'absolute',
    top: 1,
    alignSelf: 'center',
    width: 18,
    height: 5,
    borderRadius: 2,
    opacity: 0.92,
  },
  eventStickyText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 140,
  },
  heroBlock: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6C63FF1A',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#6C63FF44',
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: {
    color: '#9D97FF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  groupName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    maxWidth: '92%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontSize: 13,
    color: '#9D97FF',
    fontWeight: '600',
  },
  selectedDayCard: {
    marginTop: 14,
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 14,
  },
  selectedDayLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectedDayValue: {
    color: '#eee',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventsSection: {
    marginTop: 16,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  subsectionTitle: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '600',
  },
  subsectionMeta: {
    color: '#666',
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 16,
  },
  emptyTitle: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyDescription: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    marginTop: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  eventTitle: {
    flex: 1,
    color: '#eee',
    fontSize: 15,
    fontWeight: '600',
  },
  eventTypeBadge: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventMeta: {
    color: '#666',
    fontSize: 13,
    marginBottom: 10,
  },
  eventActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  eventActionButton: {
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#2b2b2b',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  eventActionText: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '600',
  },
  eventActionDelete: {
    borderColor: '#FF5A6B55',
    backgroundColor: '#FF5A6B14',
  },
  eventActionDeleteText: {
    color: '#FF9BA4',
  },
  chatPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
    backgroundColor: '#141414',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 16,
    maxHeight: 320,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chatPanelTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#ddd',
  },
  chatClose: {
    color: '#9D97FF',
    fontSize: 13,
    fontWeight: '600',
  },
  chatMessagesList: {
    maxHeight: 170,
    marginBottom: 10,
  },
  messageItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  messageAuthor: {
    fontWeight: '600',
    color: '#eee',
    fontSize: 13,
    marginBottom: 2,
  },
  messageText: {
    color: '#777',
    fontSize: 13,
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  chatSendButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  chatSendButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  chatFab: {
    position: 'absolute',
    bottom: 94,
    right: 20,
    backgroundColor: '#6C63FF',
    width: 54,
    height: 54,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chatFabIcon: {
    fontSize: 22,
  },
  addEventBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#7E76FF',
  },
  addEventText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 18,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    color: '#9D97FF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#bbb',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  typeRow: {
    gap: 10,
    marginTop: 4,
    marginBottom: 18,
  },
  typeButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    backgroundColor: '#101010',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  typeButtonActiveBlue: {
    backgroundColor: '#4DA3FF22',
    borderColor: '#4DA3FF55',
  },
  typeButtonActiveRed: {
    backgroundColor: '#FF5A6B22',
    borderColor: '#FF5A6B55',
  },
  typeButtonText: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});