import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export default function ProfileScreen() {
  const { author, updateAuthor, logout } = useAuth();
  const { showToast } = useToast();

  const [authorName, setAuthorName] = useState(author?.author_name || '');
  const [bookTitle, setBookTitle] = useState(author?.book_title || '');
  const [bio, setBio] = useState(author?.bio || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const handleUpdateProfile = async () => {
    if (!authorName.trim() || !bookTitle.trim()) {
      return showToast('Name and book title are required', 'error');
    }
    setSaving(true);
    try {
      const { data } = await api.put('/api/auth/profile', {
        author_name: authorName.trim(),
        book_title: bookTitle.trim(),
        bio: bio.trim(),
      });
      updateAuthor(data.author);
      showToast('Profile updated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return showToast('Both password fields are required', 'error');
    }
    if (newPassword.length < 6) {
      return showToast('New password must be at least 6 characters', 'error');
    }
    setChangingPw(true);
    try {
      await api.put('/api/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.prompt(
      'Delete Account',
      'Enter your password to confirm. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password) => {
            if (!password) return;
            try {
              await api.delete('/api/auth/account', { data: { password } });
              showToast('Account deleted');
              logout();
            } catch (err) {
              showToast(err.response?.data?.error || 'Failed to delete account', 'error');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: author?.avatar_color || colors.primary }]}>
          <Text style={styles.avatarText}>
            {author?.author_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.email}>{author?.email}</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <Text style={styles.label}>Author Name</Text>
        <TextInput
          style={styles.input}
          value={authorName}
          onChangeText={setAuthorName}
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Book Title</Text>
        <TextInput
          style={styles.input}
          value={bookTitle}
          onChangeText={setBookTitle}
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, saving && styles.btnDisabled]}
          onPress={handleUpdateProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={colors.textDim}
          secureTextEntry
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={colors.textDim}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.primaryBtn, changingPw && styles.btnDisabled]}
          onPress={handleChangePassword}
          disabled={changingPw}
        >
          {changingPw ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Ionicons name="warning-outline" size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '700' },
  email: { ...fonts.small, marginTop: spacing.sm },
  section: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { ...fonts.subheading, marginBottom: spacing.sm },
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
  textArea: { minHeight: 80 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoutText: { color: colors.error, fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  deleteText: { color: colors.error, fontSize: 13 },
});
