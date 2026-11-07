import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getErrorMessage, type WorkoutSet } from '../lib/workoutSets';

type Props = {
  set: WorkoutSet;
  onDelete: (id: string) => Promise<void>;
};

export default function SetRow({ set, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(set.id);
      // Success: the parent removes this row, so this component unmounts.
      // Nothing to reset here.
    } catch (e) {
      setError(getErrorMessage(e));
      setDeleting(false);
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <View style={styles.main}>
          <Text style={styles.exercise}>{set.exercise_name}</Text>
          <Text>
            {set.weight} × {set.reps}
            {set.rpe !== null ? `  ·  RPE ${set.rpe}` : ''}
          </Text>
          <Text style={styles.muted}>
            {new Date(set.created_at).toLocaleString()}
          </Text>
        </View>

        {deleting ? (
          <ActivityIndicator />
        ) : confirming ? (
          <View style={styles.confirmBox}>
            <Pressable onPress={handleConfirm}>
              <Text style={styles.danger}>Yes, delete</Text>
            </Pressable>
            <Pressable onPress={() => setConfirming(false)}>
              <Text style={styles.link}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setError(null);
              setConfirming(true);
            }}
          >
            <Text style={styles.danger}>Delete</Text>
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    gap: 6,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  main: { flex: 1, gap: 2 },
  exercise: { fontSize: 16, fontWeight: '600' },
  muted: { color: '#666' },
  confirmBox: { alignItems: 'flex-end', gap: 6 },
  danger: { color: '#b91c1c', fontWeight: '600' },
  link: { color: '#2563eb' },
  error: { color: '#b91c1c', fontSize: 13 },
});