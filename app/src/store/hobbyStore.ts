import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Hobby, TechniqueStatus, Resource, Progress, UserProfile } from '../types/models';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const HOBBY_IDS_KEY = 'hobyay:hobbyIds';
const PROFILE_KEY = 'hobyay:profile';
const hobbyKey = (id: string) => `hobyay:hobby:${id}`;

// ─── Pure Functions ──────────────────────────────────────────────────────────

export { getProgress } from '../utils/progress';

// ─── Index Management ────────────────────────────────────────────────────────

async function getHobbyIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(HOBBY_IDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function setHobbyIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(HOBBY_IDS_KEY, JSON.stringify(ids));
}

// ─── CRUD Operations ────────────────────────────────────────────────────────

export async function loadHobbies(): Promise<Hobby[]> {
  try {
    const ids = await getHobbyIds();
    if (ids.length === 0) return [];

    const keys = ids.map(hobbyKey);
    const pairs = await AsyncStorage.multiGet(keys);

    const hobbies: Hobby[] = [];
    for (const [, value] of pairs) {
      if (value) {
        try {
          hobbies.push(JSON.parse(value) as Hobby);
        } catch {
          // Skip corrupted entries
        }
      }
    }

    // Sort by creation date, newest first
    hobbies.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return hobbies;
  } catch {
    return [];
  }
}

export async function saveHobby(hobby: Hobby): Promise<void> {
  const ids = await getHobbyIds();
  if (!ids.includes(hobby.id)) {
    ids.unshift(hobby.id); // Add to front (newest first)
    await setHobbyIds(ids);
  }
  await AsyncStorage.setItem(hobbyKey(hobby.id), JSON.stringify(hobby));
}

export async function deleteHobby(id: string): Promise<void> {
  const ids = await getHobbyIds();
  const filtered = ids.filter((hid) => hid !== id);
  await setHobbyIds(filtered);
  await AsyncStorage.removeItem(hobbyKey(id));
}

export async function loadHobby(id: string): Promise<Hobby | null> {
  try {
    const raw = await AsyncStorage.getItem(hobbyKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Hobby;
  } catch {
    return null;
  }
}

export async function updateTechniqueStatus(
  hobbyId: string,
  techniqueId: string,
  status: TechniqueStatus
): Promise<Hobby> {
  const hobby = await loadHobby(hobbyId);
  if (!hobby) {
    throw new Error(`Hobby not found: ${hobbyId}`);
  }

  const updatedTechniques = hobby.techniques.map((t) =>
    t.id === techniqueId
      ? { ...t, status, statusUpdatedAt: new Date().toISOString() }
      : t
  );

  const updated: Hobby = { ...hobby, techniques: updatedTechniques };
  await AsyncStorage.setItem(hobbyKey(hobbyId), JSON.stringify(updated));
  return updated;
}

export async function updateTechniqueResources(
  hobbyId: string,
  techniqueId: string,
  resources: Resource[]
): Promise<void> {
  const hobby = await loadHobby(hobbyId);
  if (!hobby) return;

  const updatedTechniques = hobby.techniques.map((t) =>
    t.id === techniqueId ? { ...t, resources } : t
  );

  const updated: Hobby = { ...hobby, techniques: updatedTechniques };
  await AsyncStorage.setItem(hobbyKey(hobbyId), JSON.stringify(updated));
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
