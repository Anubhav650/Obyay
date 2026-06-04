import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Alert, Platform, ActionSheetIOS, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHobbies } from '../src/hooks/useHobbies';
import { loadProfile } from '../src/store/hobbyStore';
import { HobbyCard } from '../src/components/HobbyCard';
import { EmptyState } from '../src/components/EmptyState';
import { FAB } from '../src/components/FAB';
import { Skeleton } from '../src/components/Skeleton';
import type { Hobby } from '../src/types/models';
import { colors, spacing } from '../src/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hobbies, loading, deleteHobby } = useHobbies();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await loadProfile();
      if (!profile) {
        router.replace('/onboarding');
      } else {
        setCheckingProfile(false);
      }
    })();
  }, [router]);

  const handleAddPress = useCallback(() => {
    router.push('/new');
  }, [router]);

  const handleHobbyPress = useCallback(
    (hobby: Hobby) => {
      router.push(`/hobby/${hobby.id}`);
    },
    [router]
  );

  const handleHobbyLongPress = useCallback(
    (hobby: Hobby) => {
      const doDelete = () => {
        Alert.alert(
          'Delete Hobby',
          `Are you sure you want to delete "${hobby.name}"? This cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteHobby(hobby.id),
            },
          ]
        );
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Delete Hobby'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
            title: hobby.name,
          },
          (index) => {
            if (index === 1) doDelete();
          }
        );
      } else {
        doDelete();
      }
    },
    [deleteHobby]
  );

  const renderItem = useCallback(
    ({ item }: { item: Hobby }) => (
      <HobbyCard
        hobby={item}
        onPress={() => handleHobbyPress(item)}
        onLongPress={() => handleHobbyLongPress(item)}
      />
    ),
    [handleHobbyPress, handleHobbyLongPress]
  );

  const keyExtractor = useCallback((item: Hobby) => item.id, []);

  if (loading || checkingProfile) {
    return (
      <View style={styles.container}>
        <Skeleton rows={4} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hobbies.length === 0 ? (
        <EmptyState
          emoji="🚀"
          title="No hobbies yet"
          subtitle="Tap + to start learning something new"
        />
      ) : (
        <FlatList
          data={hobbies}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
      <FAB onPress={handleAddPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    paddingTop: spacing.base,
  },
});
