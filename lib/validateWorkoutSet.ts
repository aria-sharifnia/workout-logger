export const LIMITS = {
  nameMaxLength: 100,
  weightMax: 2000,
  repsMax: 1000,
  rpeMin: 1,
  rpeMax: 10,
} as const;

// What the inputs hold: always strings, because that's what TextInput gives you.
export type WorkoutSetFormValues = {
  exerciseName: string;
  weight: string;
  reps: string;
  rpe: string;
};

// What we send to the database: real numbers, with RPE optional.
export type WorkoutSetInput = {
  exercise_name: string;
  weight: number;
  reps: number;
  rpe: number | null;
};

export type FieldErrors = Partial<Record<keyof WorkoutSetFormValues, string>>;

export type ValidationResult =
  | { ok: true; value: WorkoutSetInput }
  | { ok: false; errors: FieldErrors };

const DECIMAL_PATTERN = /^\d+([.,]\d+)?$/; // 62.5, 62,5, 100 (no signs, no exponents)
const INTEGER_PATTERN = /^\d+$/;

function toNumber(text: string): number {
  return Number(text.replace(',', '.'));
}

function hasAtMostDecimals(n: number, places: number): boolean {
  const factor = 10 ** places;
  return Math.abs(n * factor - Math.round(n * factor)) < 1e-9;
}

export function validateWorkoutSet(values: WorkoutSetFormValues): ValidationResult {
  const errors: FieldErrors = {};

  const name = values.exerciseName.trim();
  if (name.length === 0) {
    errors.exerciseName = 'Enter an exercise name.';
  } else if (name.length > LIMITS.nameMaxLength) {
    errors.exerciseName = `Use at most ${LIMITS.nameMaxLength} characters.`;
  }

  let weight = 0;
  const weightText = values.weight.trim();
  if (weightText === '') {
    errors.weight = 'Enter a weight.';
  } else if (!DECIMAL_PATTERN.test(weightText)) {
    errors.weight = 'Enter a number, like 62.5.';
  } else {
    weight = toNumber(weightText);
    if (weight > LIMITS.weightMax) {
      errors.weight = `Max ${LIMITS.weightMax}.`;
    } else if (!hasAtMostDecimals(weight, 2)) {
      errors.weight = 'Use at most 2 decimal places.';
    }
  }

  let reps = 0;
  const repsText = values.reps.trim();
  if (repsText === '') {
    errors.reps = 'Enter reps.';
  } else if (!INTEGER_PATTERN.test(repsText)) {
    errors.reps = 'Use a whole number.';
  } else {
    reps = Number(repsText);
    if (reps < 1 || reps > LIMITS.repsMax) {
      errors.reps = `Enter 1 to ${LIMITS.repsMax}.`;
    }
  }

  let rpe: number | null = null; // optional
  const rpeText = values.rpe.trim();
  if (rpeText !== '') {
    if (!DECIMAL_PATTERN.test(rpeText)) {
      errors.rpe = 'Enter a number, like 8.5.';
    } else {
      const parsed = toNumber(rpeText);
      if (parsed < LIMITS.rpeMin || parsed > LIMITS.rpeMax) {
        errors.rpe = `Enter ${LIMITS.rpeMin} to ${LIMITS.rpeMax}.`;
      } else if (!hasAtMostDecimals(parsed, 1)) {
        errors.rpe = 'Use at most 1 decimal place.';
      } else {
        rpe = parsed;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { exercise_name: name, weight, reps, rpe } };
}