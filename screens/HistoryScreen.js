import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../supabaseClient';
import { Text, List } from 'react-native-paper';

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);
  const palette = ['#2e7d32', '#f9a825', '#c62828'];

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('exercise_log')
        .select(
          'log_date, set_number, reps_done, load_used, effort_level, ' +
          'exercises(name, days(title))'
        )
        .order('log_date', { ascending: false });
      setLogs(data || []);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 10 }}>
        Storico Allenamenti
      </Text>
      <ScrollView
        data={logs}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.log_date} – ${item.exercises.name} (${item.exercises.days.title})`}
            description={`Set ${item.set_number}: ${item.reps_done} reps @ ${item.load_used}`}
            left={() => (
              <List.Icon icon="circle" color={palette[item.effort_level]} />
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
