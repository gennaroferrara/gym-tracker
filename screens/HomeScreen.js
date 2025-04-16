import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from '../supabaseClient';
import {
  TextInput, Button, Card, Title,
  ActivityIndicator, IconButton, Dialog, Portal, Text,
} from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  const [days, setDays]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  // dialog rename
  const [editDay, setEditDay] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => { fetchDays(); }, []);

  async function fetchDays() {
    setLoading(true);
    const { data } = await supabase.from('days').select('*').order('created_at');
    setDays(data || []);
    setLoading(false);
  }

  async function addDay() {
    if (!newTitle.trim()) return;
    const { error } = await supabase.from('days').insert([{ title: newTitle.trim() }]);
    if (!error) { setNewTitle(''); fetchDays(); } else alert(error.message);
  }

  async function deleteDay(id) {
    if (confirm('Eliminare il giorno?')) {
      await supabase.from('days').delete().eq('id', id);
      fetchDays();
    }
  }

  async function saveRename() {
    await supabase.from('days').update({ title: editTitle }).eq('id', editDay.id);
    setEditDay(null); setEditTitle(''); fetchDays();
  }

  return (
    <View style={styles.container}>
      <Title style={{ marginBottom: 8 }}>I tuoi Allenamenti</Title>

      <TextInput
        mode="outlined"
        placeholder="Nuovo Day (es. Day 1)"
        value={newTitle}
        onChangeText={setNewTitle}
        style={{ marginBottom: 8 }}
      />
      <Button icon="plus" mode="contained" onPress={addDay}>
        Aggiungi Giorno
      </Button>

      {loading
        ? <ActivityIndicator style={{ marginTop: 20 }} />
        : days.map(day => (
            <Card
              key={day.id}
              mode="outlined"
              style={{ marginTop: 12 }}
              onPress={() => navigation.navigate('Day', { dayId: day.id, dayTitle: day.title })}
            >
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Title style={{ flex: 1 }}>{day.title}</Title>

                <IconButton
                  icon="pencil"
                  onPress={() => { setEditDay(day); setEditTitle(day.title); }}
                />
                <IconButton
                  icon="delete"
                  onPress={() => deleteDay(day.id)}
                />
              </Card.Content>
            </Card>
          ))
      }

      {/* dialog rename */}
      <Portal>
        <Dialog visible={!!editDay} onDismiss={() => setEditDay(null)}>
          <Dialog.Title>Rinomina Day</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDay(null)}>Annulla</Button>
            <Button onPress={saveRename}>Salva</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
