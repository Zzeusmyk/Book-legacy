import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return showToast('Email and password are required', 'error');
    }
    if (!isLogin && (!authorName.trim() || !bookTitle.trim())) {
      return showToast('All fields are required', 'error');
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
        showToast('Welcome back!');
      } else {
        await register({
          email: email.trim(),
          password,
          author_name: authorName.trim(),
          book_title: bookTitle.trim(),
        });
        showToast('Account created!');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('jane@demo.com');
    setPassword('demo1234');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>BookLegacy</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Author Name</Text>
              <TextInput
                style={styles.input}
                value={authorName}
                onChangeText={setAuthorName}
                placeholder="Your name"
                placeholderTextColor={colors.textDim}
                autoCapitalize="words"
              />
              <Text style={styles.label}>Book Title</Text>
              <TextInput
                style={styles.input}
                value={bookTitle}
                onChangeText={setBookTitle}
                placeholder="Your book's title"
                placeholderTextColor={colors.textDim}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={fillDemo} style={styles.demo}>
              <Text style={styles.demoText}>Use Demo Account</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 32, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  subtitle: { ...fonts.regular, marginTop: spacing.sm, color: colors.textMuted },
  form: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  label: { ...fonts.small, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  toggle: { alignItems: 'center', marginTop: spacing.lg },
  toggleText: { color: colors.textMuted, fontSize: 14 },
  toggleLink: { color: colors.primary, fontWeight: '600' },
  demo: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  demoText: { color: colors.info, fontSize: 13, fontWeight: '500' },
});
