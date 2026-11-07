import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import {
  createWorkoutSet,
  getErrorMessage,
  type WorkoutSet,
} from '../lib/workoutSets';
import {
  validateWorkoutSet,
  type FieldErrors,
  type WorkoutSetFormValues,
} from '../lib/validateWorkoutSet';

const EMPTY: WorkoutSetFormValues = {
  exerciseName: '',
  weight: '',
  reps: '',
  rpe: '',
};

type Props = { onAdded: (set: WorkoutSet) => void };

type FieldProps = TextInputProps & { error?: string };

function Field({ error, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <TextInput
        {...inputProps}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function AddSetForm({ onAdded }: Props) {
  const [values, setValues] = useState<WorkoutSetFormValues>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof WorkoutSetFormValues, text: string) {
    setValues((prev) => ({ ...prev, [field]: text }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit() {
    if (submitting) return;

    const result = validateWorkoutSet(values);
    if (!result.ok) {
      setFieldErrors(result.errors);
      setSubmitError(null);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createWorkoutSet(result.value);
      onAdded(created);
      setValues(EMPTY);
      setFieldErrors({});
    } catch (e) {
      setSubmitError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Log a set</Text>

      <Field
        placeholder="Exercise (e.g. Squat)"
        value={values.exerciseName}
        onChangeText={(t) => update('exerciseName', t)}
        error={fieldErrors.exerciseName}
        editable={!submitting}
      />

      <View style={styles.row}>
        <View style={styles.cell}>
          <Field
            placeholder="Weight"
            value={values.weight}
            onChangeText={(t) => update('weight', t)}
            error={fieldErrors.weight}
            keyboardType="decimal-pad"
            editable={!submitting}
          />
        </View>
        <View style={styles.cell}>
          <Field
            placeholder="Reps"
            value={values.reps}
            onChangeText={(t) => update('reps', t)}
            error={fieldErrors.reps}
            keyboardType="number-pad"
            editable={!submitting}
          />
        </View>
        <View style={styles.cell}>
          <Field
            placeholder="RPE (opt.)"
            value={values.rpe}
            onChangeText={(t) => update('rpe', t)}
            error={fieldErrors.rpe}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!submitting}
          />
        </View>
      </View>

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add set</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  heading: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  cell: { flex: 1 },
  field: { gap: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  inputError: { borderColor: '#b91c1c' },
  error: { color: '#b91c1c', fontSize: 13 },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
});