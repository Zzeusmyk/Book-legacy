import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, fonts } from '../theme';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const STATUS_FILTERS = ['all', 'draft', 'published'];

export default function ChaptersScreen({ navigation }) {
  const [chapters, setChapters] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchChapters = async () => {
    try {
      const params = { sort: 'chapter_number', order: 'asc' };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/api/chapters', { params });
      setChapters(data.chapters);
    } catch {
      showToast('Failed to load chapters', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChapters();
    }, [search, statusFilter])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChapters();
    setRefreshing(false);
  };

  const deleteChapter = (chapter) => {
    Alert.alert(
      'Delete Chapter',
      `Delete "${chapter.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/chapters/${chapter.id}`);
              showToast('Chapter deleted');
              fetchChapters();
            } catch {
              showToast('Failed to delete', 'error');
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (chapter) => {
    try {
      await api.patch(`/api/chapters/${chapter.id}/status`);
      showToast(`Marked as ${chapter.status === 'draft' ? 'published' : 'draft'}`);
      fetchChapters();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const renderChapter = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ChapterForm', { chapter: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.chapterNum}>
          <Text style={styles.chapterNumText}>{item.chapter_number}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          {item.video_url ? (
            <View style={styles.metaTag}>
              <Ionicons name="videocam" size={12} color={colors.info} />
              <Text style={[styles.metaText, { color: colors.info }]}>Video</Text>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => toggleStatus(item)}
            style={[styles.statusBadge, item.status === 'published' ? styles.published : styles.draft]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChapterForm', { chapter: item })}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil" size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteChapter(item)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chapters..."
            placeholderTextColor={colors.textDim}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textDim} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filters}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, statusFilter === f && styles.filterActive]}
              onPress={() => setStatusFilter(f)}
            >
              <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id}
          renderItem={renderChapter}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyText}>No chapters yet</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('ChapterForm', {})}
              >
                <Text style={styles.emptyBtnText}>Create your first chapter</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ChapterForm', {})}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  toolbar: { padding: spacing.md, paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: spacing.sm, marginLeft: spacing.sm, fontSize: 15 },
  filters: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.xs },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: colors.white },
  list: { padding: spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  chapterNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  chapterNumText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  cardInfo: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  cardDesc: { ...fonts.small, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '500' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  published: { backgroundColor: colors.success + '20' },
  draft: { backgroundColor: colors.warning + '20' },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.text },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { padding: spacing.xs },
  empty: { alignItems: 'center', marginTop: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: 16, marginTop: spacing.md },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  emptyBtnText: { color: colors.white, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
