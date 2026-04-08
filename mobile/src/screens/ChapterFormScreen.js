import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, fonts } from '../theme';
import { useToast } from '../context/ToastContext';
import VideoUploader from '../components/VideoUploader';
import api from '../api/client';

export default function ChapterFormScreen({ route, navigation }) {
  const existing = route.params?.chapter;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [chapterNumber, setChapterNumber] = useState(existing?.chapter_number?.toString() || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [status, setStatus] = useState(existing?.status || 'draft');
  const [videoUrl, setVideoUrl] = useState(existing?.video_url || null);
  const [chapterId, setChapterId] = useState(existing?.id || null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!title.trim() || !chapterNumber.trim()) {
      return showToast('Title and chapter number are required', 'error');
    }

    const num = parseInt(chapterNumber, 10);
    if (isNaN(num) || num < 1) {
      return showToast('Chapter number must be a positive integer', 'error');
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        chapter_number: num,
        description: description.trim(),
        status,
      };

      if (isEdit) {
        await api.put(`/api/chapters/${existing.id}`, payload);
        showToast('Chapter updated!');
      } else {
        const { data } = await api.post('/api/chapters', payload);
        setChapterId(data.chapter.id);
        showToast('Chapter created!');
      }
      navigation.goBack();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Chapter Number</Text>
        <TextInput
          style={styles.input}
          value={chapterNumber}
          onChangeText={setChapterNumber}
          placeholder="1"
          placeholderTextColor={colors.textDim}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Chapter title"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description..."
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {['draft', 'published'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, status === s && styles.statusActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.statusText, status === s && styles.statusTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isEdit && chapterId && (
          <>
            <Text style={styles.label}>Video</Text>
            <VideoUploader
              chapterId={chapterId}
              videoUrl={videoUrl}
              onVideoChange={(ch) => setVideoUrl(ch.video_url)}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Update Chapter' : 'Create Chapter'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...fonts.small, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.lg },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  textArea: { minHeight: 100 },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  statusActive: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  statusText: { color: colors.textMuted, fontWeight: '500' },
  statusTextActive: { color: colors.primary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
