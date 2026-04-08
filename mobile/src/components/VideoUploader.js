import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, radius, fonts } from '../theme';
import { getBaseUrl } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function VideoUploader({ chapterId, videoUrl, onVideoChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('video', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'video/mp4',
      });

      const token = await SecureStore.getItemAsync('token');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${getBaseUrl()}/api/chapters/${chapterId}/video`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onVideoChange(data.chapter);
          showToast('Video uploaded!');
        } else {
          showToast('Upload failed', 'error');
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        showToast('Upload failed', 'error');
      };

      xhr.send(formData);
    } catch {
      setUploading(false);
      showToast('Could not pick file', 'error');
    }
  };

  const deleteVideo = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch(`${getBaseUrl()}/api/chapters/${chapterId}/video`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        onVideoChange(data.chapter);
        showToast('Video removed');
      }
    } catch {
      showToast('Failed to remove video', 'error');
    }
  };

  if (uploading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.progressText}>Uploading... {progress}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  }

  if (videoUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.videoInfo}>
          <Ionicons name="videocam" size={24} color={colors.info} />
          <Text style={styles.videoText}>Video attached</Text>
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.replaceBtn} onPress={pickAndUpload}>
            <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
            <Text style={styles.replaceBtnText}>Replace</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={deleteVideo}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.uploadZone} onPress={pickAndUpload}>
      <Ionicons name="cloud-upload-outline" size={32} color={colors.textDim} />
      <Text style={styles.uploadText}>Tap to upload video</Text>
      <Text style={styles.uploadHint}>MP4, WebM, MOV up to 2GB</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  progressText: { color: colors.textMuted, marginTop: spacing.sm, fontSize: 13 },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.bgActive,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  videoInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  videoText: { color: colors.text, fontWeight: '600' },
  videoActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  replaceBtnText: { color: colors.primary, fontWeight: '500', fontSize: 13 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  removeBtnText: { color: colors.error, fontWeight: '500', fontSize: 13 },
  uploadZone: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadText: { color: colors.textMuted, fontWeight: '500', marginTop: spacing.sm },
  uploadHint: { ...fonts.small, marginTop: 4 },
});
