import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from '../supabaseClient';
import {
  Text, Button, TextInput, Snackbar, List
} from 'react-native-paper';
import EffortSelector from '../components/EffortSelector';

export default function ExerciseScreen({ route }) {
  const { exerciseId } = route.params;

  const [exercise, setExercise] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [note, setNote] = useState('');
  const [effort, setEffort] = useState(0);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchExercise(); }, []);

  async function fetchExercise() {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    setExercise(data);
  }

  async function finishSet() {
    const setNumber = completed.length + 1;

    await supabase.from('exercise_log').insert([{
      exercise_id: exerciseId,
      set_number: setNumber,
      reps_done: exercise.current_target_reps,
      load_used: exercise.load,
      note,
      effort_level: effort,
    }]);

    setCompleted([
      ...completed,
      { set: setNumber, reps: exercise.current_target_reps, effort },
    ]);

    setNote('');
    setEffort(0);

    if (setNumber === exercise.sets) {
      setMsg('Tutte le serie completate ✅');
    }
  }

  if (!exercise) return null;

  const palette = ['#2e7d32', '#f9a825', '#c62828'];

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">{exercise.name}</Text>
      <Text>{completed.length}/{exercise.sets} serie completate</Text>
      <Text style={{ marginTop: 6 }}>
        Target: {exercise.current_target_reps} reps @ {exercise.load}
      </Text>

      <TextInput
        label="Nota (facoltativa)"
        value={note}
        onChangeText={setNote}
        mode="outlined"
        style={{ marginVertical: 12 }}
      />

      <EffortSelector value={effort} onChange={setEffort} />

      <Button mode="contained" icon="check" onPress={finishSet}>
        Segna serie completata
      </Button>

      <List.Section>
        {completed.map(item => (
          <List.Item
            key={item.set}
            title={`Set ${item.set}: ${item.reps} reps`}
            left={() => <List.Icon icon="circle" color={palette[item.effort]} />}
          />
        ))}
      </List.Section>

      <Snackbar visible={!!msg} onDismiss={() => setMsg('')}>
        {msg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
