import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'signup';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validate(email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleSubmit() {
    const cleanEmail = email.trim();
    const validationError = validate(cleanEmail, password);
    if (validationError) {
      setErrorMessage(validationError);
      setInfoMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const credentials = { email: cleanEmail, password };

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) setErrorMessage(error.message);
      } else {
        const { data, error } = await supabase.auth.signUp(credentials);
        if (error) setErrorMessage(error.message);
        else if (!data.session) {
          setInfoMessage('Check your email to confirm your account.');
        }
      }
    } catch {
      setErrorMessage('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrorMessage(null);
    setInfoMessage(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'login' ? 'Log in' : 'Create account'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        editable={!loading}
      />

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      {infoMessage && <Text style={styles.info}>{infoMessage}</Text>}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={toggleMode} disabled={loading}>
        <Text style={styles.link}>
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Log in'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 360, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 4 },
  error: { color: '#b91c1c' },
  info: { color: '#047857' },
});