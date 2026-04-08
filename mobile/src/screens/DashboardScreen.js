import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { author } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/stats');
      setStats(data);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.welcome}>
        <View style={[styles.avatar, { backgroundColor: author?.avatar_color || colors.primary }]}>
          <Text style={styles.avatarText}>
            {author?.author_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.welcomeText}>
          <Text style={fonts.heading}>Welcome back!</Text>
          <Text style={styles.authorName}>{author?.author_name}</Text>
          <Text style={styles.bookTitle}>{author?.book_title}</Text>
        </View>
      </View>

      {stats && (
        <>
          <View style={styles.statsGrid}>
            <StatCard icon="document-text" label="Chapters" value={stats.total_chapters} color={colors.primary} />
            <StatCard icon="videocam" label="Videos" value={stats.videos_uploaded} color={colors.info} />
            <StatCard icon="checkmark-circle" label="Published" value={stats.published_chapters} color={colors.success} />
            <StatCard icon="pencil" label="Drafts" value={stats.draft_chapters} color={colors.warning} />
          </View>

          <View style={styles.storageCard}>
            <View style={styles.storageRow}>
              <Ionicons name="cloud" size={18} color={colors.textMuted} />
              <Text style={styles.storageLabel}>Storage Used</Text>
              <Text style={styles.storageValue}>{formatBytes(stats.total_storage)}</Text>
            </View>
            {stats.total_chapters > 0 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(stats.published_chapters / stats.total_chapters) * 100}%` },
                  ]}
                />
              </View>
            )}
            <Text style={styles.progressText}>
              {stats.total_chapters > 0
                ? `${Math.round((stats.published_chapters / stats.total_chapters) * 100)}% published`
                : 'No chapters yet'}
            </Text>
          </View>

          {stats.recent_chapters?.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={fonts.subheading}>Recent Activity</Text>
              {stats.recent_chapters.map((ch) => (
                <TouchableOpacity
                  key={ch.id}
                  style={styles.recentItem}
                  onPress={() => navigation.navigate('Chapters')}
                >
                  <Ionicons
                    name={ch.video_url ? 'videocam' : 'document-text-outline'}
                    size={18}
                    color={ch.video_url ? colors.info : colors.textMuted}
                  />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      Ch. {ch.chapter_number} — {ch.title}
                    </Text>
                    <Text style={styles.recentMeta}>
                      {ch.status === 'published' ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                  <View style={[styles.badge, ch.status === 'published' ? styles.badgePublished : styles.badgeDraft]}>
                    <Text style={styles.badgeText}>{ch.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '700' },
  welcomeText: { flex: 1 },
  authorName: { color: colors.primary, fontSize: 15, fontWeight: '600', marginTop: 2 },
  bookTitle: { ...fonts.small, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLabel: { ...fonts.small, marginTop: 2 },
  storageCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storageRow: { flexDirection: 'row', alignItems: 'center' },
  storageLabel: { ...fonts.small, flex: 1, marginLeft: spacing.sm },
  storageValue: { color: colors.text, fontWeight: '700' },
  progressBar: {
    height: 6,
    backgroundColor: colors.bgActive,
    borderRadius: 3,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 3 },
  progressText: { ...fonts.small, marginTop: spacing.xs },
  recentSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentInfo: { flex: 1, marginLeft: spacing.md },
  recentTitle: { color: colors.text, fontSize: 14, fontWeight: '500' },
  recentMeta: { ...fonts.small, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  badgePublished: { backgroundColor: colors.success + '20' },
  badgeDraft: { backgroundColor: colors.warning + '20' },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.text },
});
