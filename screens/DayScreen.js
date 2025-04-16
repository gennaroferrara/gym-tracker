
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../supabaseClient';
import {
  TextInput, Button, Card, Title, Paragraph, IconButton,
  Text, Dialog, Portal,
} from 'react-native-paper';

const palette = ['#2e7d32', '#f9a825', '#c62828'];

export default function DayScreen({ route, navigation }) {
  const { dayId, dayTitle } = route.params;

  const [exercises, setExercises] = useState([]);
  const [logMap, setLogMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [repRange, setRepRange] = useState('');
  const [weight, setWeight] = useState('');
  const [exNote, setExNote] = useState('');

  const [editEx, setEditEx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => { fetchExercises(); }, []);

  async function fetchExercises() {
    setLoading(true);
    const { data: exercises } = await supabase.from('exercises').select('*').eq('day_id', dayId).order('created_at');
    setExercises(exercises || []);

    if (exercises?.length) {
      const ids = exercises.map(e => e.id);
      const { data: logs } = await supabase
        .from('exercise_log')
        .select('id, exercise_id, set_number, reps_done, load_used, note, effort_level')
        .in('exercise_id', ids)
        .order('set_number', { ascending: true });

      const group = {};
      logs?.forEach(l => {
        if (!group[l.exercise_id]) group[l.exercise_id] = [];
        group[l.exercise_id].push(l);
      });
      setLogMap(group);
    }

    setLoading(false);
  }

  async function addExercise() {
    if (!name.trim()) return;
    let minR, maxR;
    if (repRange.includes('-')) {
      [minR, maxR] = repRange.split('-').map(n => parseInt(n, 10));
    } else { minR = maxR = parseInt(repRange || '0', 10); }
    await supabase.from('exercises').insert([{
      day_id: dayId, name, sets: parseInt(sets||'0',10),
      min_reps: minR, max_reps: maxR, current_target_reps: minR,
      load: parseFloat(weight||'0'), notes: exNote,
    }]);
    setName(''); setSets(''); setRepRange(''); setWeight(''); setExNote('');
    fetchExercises();
  }

  async function deleteExercise(id) {
    if (confirm('Eliminare esercizio?')) {
      await supabase.from('exercises').delete().eq('id', id);
      fetchExercises();
    }
  }

  async function saveEdit() {
    await supabase.from('exercises')
      .update({ name: editName, notes: editNote })
      .eq('id', editEx.id);
    setEditEx(null); setEditName(''); setEditNote('');
    fetchExercises();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* 👇 tutto il tuo contenuto qui dentro */}
  
          <Title style={styles.dayTitle}>{dayTitle}</Title>
  
          {/* FORM */}
          <View style={styles.row}>
            <TextInput label="Esercizio" value={name} onChangeText={setName} mode="outlined" style={styles.inputLarge} />
            <TextInput label="Serie" value={sets} onChangeText={setSets} mode="outlined" keyboardType="numeric" style={styles.inputSmall} />
          </View>
          <View style={styles.row}>
            <TextInput label="Rep range (8-10)" value={repRange} onChangeText={setRepRange} mode="outlined" style={styles.inputLarge} />
            <TextInput label="Kg / sec" value={weight} onChangeText={setWeight} mode="outlined" keyboardType="numeric" style={styles.inputSmall} />
          </View>
          <TextInput label="Note esercizio" value={exNote} onChangeText={setExNote} mode="outlined" multiline style={{ marginBottom: 8 }} />
  
          <Button icon="plus" mode="contained" onPress={addExercise} style={{ marginBottom: 16 }}>
            Aggiungi Esercizio
          </Button>
  
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>Esercizi inseriti</Text>
  
          {/* LISTA */}
          {exercises.map(item => (
            <Card key={item.id} mode="outlined" style={{ marginBottom: 12 }} onPress={() => navigation.navigate('Exercise', { exerciseId: item.id })}>
              <Card.Content style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                  <Title>{item.name}</Title>
                  <Paragraph>{item.sets}×{item.current_target_reps} @ {item.load}</Paragraph>
                  {item.notes ? <Paragraph numberOfLines={1} style={{ fontStyle: 'italic' }}>📝 {item.notes}</Paragraph> : null}
  
                  {logMap[item.id]?.map(s => (
                    <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={{ flex: 1, fontSize: 13 }}>
                        Set {s.set_number}: {s.reps_done} reps @ {s.load_used}
                        {s.note ? ` – 📝 ${s.note}` : ' – 📝 nessuna'}
                      </Text>
                      <View style={{
                        width: 10, height: 10, borderRadius: 5,
                        backgroundColor: palette[s.effort_level],
                        marginLeft: 6,
                      }} />
                    </View>
                  ))}
                </View>
                <IconButton icon="pencil" onPress={() => {
                  setEditEx(item);
                  setEditName(item.name);
                  setEditNote(item.notes || '');
                }} />
                <IconButton icon="delete" onPress={() => deleteExercise(item.id)} />
              </Card.Content>
            </Card>
          ))}
  
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}  

const styles = StyleSheet.create({
  dayTitle:    { marginBottom: 16, fontWeight: 'bold' },
  row:         { flexDirection: 'row', gap: 8, marginBottom: 8 },
  inputLarge:  { flex: 2 },
  inputSmall:  { flex: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
});
