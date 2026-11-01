import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionCategory = 'Shooting' | 'Conditioning' | 'Strength';
type SessionStatus = 'Planned' | 'Completed';
type CategoryFilter = 'All' | SessionCategory;
type StatusFilter = 'All' | SessionStatus;

interface BasketballSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  category: SessionCategory;
  status: SessionStatus;
  notes: string;
}

const STORAGE_KEY = '@hoop_session_tracker_sessions';
const categories: SessionCategory[] = ['Shooting', 'Conditioning', 'Strength'];
const statuses: SessionStatus[] = ['Planned', 'Completed'];

type ChoiceButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

// Reusable button used by the category, status, and filter controls.
function ChoiceButton({label, selected, onPress}: ChoiceButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

type SessionCardProps = {
  session: BasketballSession;
  onEdit: (session: BasketballSession) => void;
  onDelete: (id: string) => void;
};

// Displays one record and exposes the update and delete actions.
function SessionCard({session, onEdit, onDelete}: SessionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{session.title}</Text>
        <View
          style={[
            styles.statusBadge,
            session.status === 'Completed'
              ? styles.completedBadge
              : styles.plannedBadge,
          ]}>
          <Text style={styles.statusBadgeText}>{session.status}</Text>
        </View>
      </View>

      <Text style={styles.cardDetail}>Category: {session.category}</Text>
      <Text style={styles.cardDetail}>Date: {session.date}</Text>
      <Text style={styles.cardDetail}>Duration: {session.duration} minutes</Text>
      {session.notes.length > 0 && (
        <Text style={styles.cardNotes}>Notes: {session.notes}</Text>
      )}

      <View style={styles.cardActions}>
        <Pressable style={styles.editButton} onPress={() => onEdit(session)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => onDelete(session.id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function App(): React.JSX.Element {
  const [sessions, setSessions] = useState<BasketballSession[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<SessionCategory>('Shooting');
  const [status, setStatus] = useState<SessionStatus>('Planned');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [storageLoaded, setStorageLoaded] = useState(false);

  // Load saved records once when the application starts.
  useEffect(() => {
    async function loadSessions() {
      try {
        const savedSessions = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedSessions !== null) {
          const parsedSessions: BasketballSession[] = JSON.parse(savedSessions);
          setSessions(parsedSessions);
        }
      } catch {
        Alert.alert('Storage error', 'Saved sessions could not be loaded.');
      } finally {
        setStorageLoaded(true);
      }
    }

    loadSessions();
  }, []);

  // Save the collection whenever it changes after the first load finishes.
  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    async function saveSessions() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch {
        Alert.alert('Storage error', 'Your latest changes could not be saved.');
      }
    }

    saveSessions();
  }, [sessions, storageLoaded]);

  function resetForm() {
    setTitle('');
    setDate('');
    setDuration('');
    setNotes('');
    setCategory('Shooting');
    setStatus('Planned');
    setEditingId(null);
    setValidationMessage('');
  }

  function dateIsValid(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const parsedDate = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === value;
  }

  function saveRecord() {
    const trimmedTitle = title.trim();
    const trimmedDate = date.trim();
    const numericDuration = Number(duration);

    if (trimmedTitle.length === 0) {
      setValidationMessage('Enter a session title.');
      return;
    }

    if (!dateIsValid(trimmedDate)) {
      setValidationMessage('Enter a valid date in YYYY-MM-DD format.');
      return;
    }

    if (!Number.isInteger(numericDuration) || numericDuration <= 0) {
      setValidationMessage('Duration must be a positive whole number.');
      return;
    }

    if (editingId !== null) {
      setSessions(currentSessions =>
        currentSessions.map(session =>
          session.id === editingId
            ? {
                ...session,
                title: trimmedTitle,
                date: trimmedDate,
                duration: numericDuration,
                category,
                status,
                notes: notes.trim(),
              }
            : session,
        ),
      );
    } else {
      const newSession: BasketballSession = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: trimmedTitle,
        date: trimmedDate,
        duration: numericDuration,
        category,
        status,
        notes: notes.trim(),
      };
      setSessions(currentSessions => [newSession, ...currentSessions]);
    }

    resetForm();
  }

  function beginEditing(session: BasketballSession) {
    setTitle(session.title);
    setDate(session.date);
    setDuration(String(session.duration));
    setNotes(session.notes);
    setCategory(session.category);
    setStatus(session.status);
    setEditingId(session.id);
    setValidationMessage('');
  }

  function deleteRecord(id: string) {
    Alert.alert('Delete session?', 'This action cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSessions(currentSessions =>
            currentSessions.filter(session => session.id !== id),
          );
          if (editingId === id) {
            resetForm();
          }
        },
      },
    ]);
  }

  const filteredSessions = sessions.filter(session => {
    const categoryMatches =
      categoryFilter === 'All' || session.category === categoryFilter;
    const statusMatches = statusFilter === 'All' || session.status === statusFilter;
    return categoryMatches && statusMatches;
  });

  const formAndFilters = (
    <>
      <View style={styles.hero}>
        <Text style={styles.appTitle}>Hoop Session Tracker</Text>
        <Text style={styles.subtitle}>
          Plan basketball workouts and keep your progress between sessions.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>
          {editingId === null ? 'Add a Session' : 'Edit Session'}
        </Text>

        <Text style={styles.label}>Session title</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Free throw practice"
          placeholderTextColor="#6b7c86"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#6b7c86"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Duration in minutes</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 45"
          placeholderTextColor="#6b7c86"
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.choiceRow}>
          {categories.map(item => (
            <ChoiceButton
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.choiceRow}>
          {statuses.map(item => (
            <ChoiceButton
              key={item}
              label={item}
              selected={status === item}
              onPress={() => setStatus(item)}
            />
          ))}
        </View>

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Add workout details"
          placeholderTextColor="#6b7c86"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

        {validationMessage.length > 0 && (
          <Text style={styles.validationText}>{validationMessage}</Text>
        )}

        <Pressable style={styles.saveButton} onPress={saveRecord}>
          <Text style={styles.saveButtonText}>
            {editingId === null ? 'Add Session' : 'Save Changes'}
          </Text>
        </Pressable>

        {editingId !== null && (
          <Pressable style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelButtonText}>Cancel Editing</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Filter Sessions</Text>
        <Text style={styles.label}>Category</Text>
        <View style={styles.choiceRow}>
          {(['All', ...categories] as CategoryFilter[]).map(item => (
            <ChoiceButton
              key={item}
              label={item}
              selected={categoryFilter === item}
              onPress={() => setCategoryFilter(item)}
            />
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.choiceRow}>
          {(['All', ...statuses] as StatusFilter[]).map(item => (
            <ChoiceButton
              key={item}
              label={item}
              selected={statusFilter === item}
              onPress={() => setStatusFilter(item)}
            />
          ))}
        </View>

        <Text style={styles.resultCount}>
          Showing {filteredSessions.length} of {sessions.length} sessions
        </Text>
      </View>

      <Text style={styles.listHeading}>Saved Sessions</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={filteredSessions}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <SessionCard session={item} onEdit={beginEditing} onDelete={deleteRecord} />
          )}
          ListHeaderComponent={formAndFilters}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No sessions found</Text>
              <Text style={styles.emptyText}>
                Add a new session or change the selected filters.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  safeArea: {flex: 1, backgroundColor: '#123b56'},
  listContent: {backgroundColor: '#edf5f8', paddingBottom: 32},
  hero: {backgroundColor: '#123b56', paddingHorizontal: 22, paddingVertical: 24},
  appTitle: {color: '#ffffff', fontSize: 29, fontWeight: '800'},
  subtitle: {color: '#dcecf4', fontSize: 15, lineHeight: 21, marginTop: 7},
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    margin: 16,
    padding: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderColor: '#c5dbe6',
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
  },
  sectionTitle: {color: '#123b56', fontSize: 22, fontWeight: '800', marginBottom: 12},
  label: {color: '#294b5e', fontSize: 15, fontWeight: '700', marginBottom: 7, marginTop: 8},
  input: {
    backgroundColor: '#f7fafc',
    borderColor: '#a9c4d3',
    borderRadius: 10,
    borderWidth: 1,
    color: '#17384b',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  notesInput: {height: 82},
  choiceRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4},
  choiceButton: {
    backgroundColor: '#e8f1f5',
    borderColor: '#bdd2dd',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  choiceButtonSelected: {backgroundColor: '#f47b20', borderColor: '#f47b20'},
  choiceText: {color: '#294b5e', fontSize: 14, fontWeight: '700'},
  choiceTextSelected: {color: '#ffffff'},
  validationText: {color: '#b3261e', fontSize: 14, fontWeight: '700', marginTop: 12},
  saveButton: {backgroundColor: '#123b56', borderRadius: 11, marginTop: 16, padding: 14},
  saveButtonText: {color: '#ffffff', fontSize: 17, fontWeight: '800', textAlign: 'center'},
  cancelButton: {borderColor: '#819da9', borderRadius: 11, borderWidth: 1, marginTop: 10, padding: 12},
  cancelButtonText: {color: '#294b5e', fontSize: 16, fontWeight: '700', textAlign: 'center'},
  resultCount: {color: '#567080', fontSize: 14, marginTop: 11},
  listHeading: {color: '#123b56', fontSize: 23, fontWeight: '800', marginBottom: 10, marginHorizontal: 16},
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#c5dbe6',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 17,
  },
  cardHeader: {alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  cardTitle: {color: '#123b56', flex: 1, fontSize: 20, fontWeight: '800', marginRight: 8},
  statusBadge: {borderRadius: 15, paddingHorizontal: 10, paddingVertical: 5},
  completedBadge: {backgroundColor: '#2d7d46'},
  plannedBadge: {backgroundColor: '#d85b0d'},
  statusBadgeText: {color: '#ffffff', fontSize: 12, fontWeight: '800'},
  cardDetail: {color: '#37566a', fontSize: 15, lineHeight: 22},
  cardNotes: {color: '#567080', fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginTop: 5},
  cardActions: {flexDirection: 'row', gap: 10, marginTop: 14},
  editButton: {backgroundColor: '#1976a3', borderRadius: 9, flex: 1, padding: 11},
  deleteButton: {backgroundColor: '#b3261e', borderRadius: 9, flex: 1, padding: 11},
  actionButtonText: {color: '#ffffff', fontSize: 15, fontWeight: '800', textAlign: 'center'},
  emptyCard: {alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, marginHorizontal: 16, padding: 28},
  emptyTitle: {color: '#123b56', fontSize: 19, fontWeight: '800'},
  emptyText: {color: '#567080', fontSize: 14, lineHeight: 20, marginTop: 6, textAlign: 'center'},
});

export default App;
