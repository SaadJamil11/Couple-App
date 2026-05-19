import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import {
  requestPhotoPermission, fetchLibraryPage,
} from '../services/photos';
import { getSelectedPhotoIds, setSelectedPhotoIds } from '../services/storage';

const COLS = 3;
const GAP = 6;
const SIZE = (Dimensions.get('window').width - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

// Photo picker. Manual tagging today; the design leaves room for an
// auto-detect "couple photo" pass in v2.
export default function PhotoPickerScreen({ navigation }) {
  const [assets, setAssets] = useState([]);
  const [cursor, setCursor] = useState(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [initialised, setInitialised] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const init = useCallback(async () => {
    const granted = await requestPhotoPermission();
    if (!granted) { setPermissionDenied(true); setInitialised(true); return; }
    const ids = await getSelectedPhotoIds();
    setSelected(new Set(ids));
    await loadMore(undefined, true);
    setInitialised(true);
  }, []);

  const loadMore = useCallback(async (after, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetchLibraryPage({ after, pageSize: 60 });
      setAssets((prev) => (reset ? res.assets : [...prev, ...res.assets]));
      setCursor(res.endCursor);
      setHasMore(res.hasNextPage);
    } catch (e) {
      Alert.alert('Could not read library', e?.message || 'Please allow access in Settings.');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { init(); }, [init]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    await setSelectedPhotoIds(Array.from(selected));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="pp-back">
          <Text style={[text.title, { color: colors.ink }]}>‹</Text>
        </Pressable>
      </View>
      <ScreenHeader
        eyebrow="Pick the ones that are us"
        title="Photo Library"
        subtitle={`${selected.size} selected · they\u2019ll appear on your timeline.`}
        right={
          <PrimaryButton
            label="Save"
            onPress={save}
            testID="pp-save"
          />
        }
      />

      {!initialised ? (
        <ActivityIndicator color={colors.terracotta} style={{ marginTop: spacing.xl }} />
      ) : permissionDenied ? (
        <View style={{ padding: spacing.lg }}>
          <Text style={[text.body, { color: colors.inkSoft }]}>
            Tethered needs photo library access to build your shared timeline.
            Open your system Settings and grant access for this app.
          </Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(a) => a.id}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.sm }}
          onEndReachedThreshold={0.5}
          onEndReached={() => hasMore && loadMore(cursor)}
          ListFooterComponent={loading ? <ActivityIndicator color={colors.terracotta} style={{ marginVertical: spacing.lg }} /> : null}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                testID={`pp-asset-${item.id}`}
                style={{
                  width: SIZE,
                  height: SIZE,
                  borderRadius: radius.sm,
                  overflow: 'hidden',
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: colors.terracotta,
                }}
              >
                <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                {isSelected ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: colors.terracotta,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.paper, fontSize: 12, fontWeight: '700' }}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
