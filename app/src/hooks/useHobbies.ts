import { useState, useEffect, useCallback, useRef } from 'react';
import type { Hobby, GoalLevel, TechniqueStatus } from '../types/models';
import * as store from '../store/hobbyStore';
import { generatePlan, getErrorMessage } from '../api/client';
import { generateUUID } from '../utils/uuid';

interface UseHobbiesReturn {
  hobbies: Hobby[];
  loading: boolean;
  error: string | null;
  createHobby: (name: string, level: GoalLevel) => Promise<Hobby>;
  deleteHobby: (id: string) => Promise<void>;
  updateTechniqueStatus: (
    hobbyId: string,
    techniqueId: string,
    status: TechniqueStatus
  ) => Promise<Hobby | null>;
  refreshHobbies: () => Promise<void>;
}

export function useHobbies(): UseHobbiesReturn {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loaded = await store.loadHobbies();
      if (mountedRef.current) {
        setHobbies(loaded);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to load hobbies');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const createHobby = useCallback(
    async (name: string, level: GoalLevel): Promise<Hobby> => {
      const profile = await store.loadProfile();
      const plan = await generatePlan(name, level, profile);

      const hobby: Hobby = {
        id: generateUUID(),
        name: plan.hobby,
        level: plan.level,
        summary: plan.summary,
        techniques: plan.techniques.map((t) => ({
          ...t,
          id: t.id || generateUUID(),
          status: 'pending' as TechniqueStatus,
          statusUpdatedAt: null,
          resources: null,
        })),
        createdAt: new Date().toISOString(),
      };

      await store.saveHobby(hobby);

      if (mountedRef.current) {
        setHobbies((prev) => [hobby, ...prev]);
      }

      return hobby;
    },
    []
  );

  const deleteHobby = useCallback(async (id: string) => {
    await store.deleteHobby(id);
    if (mountedRef.current) {
      setHobbies((prev) => prev.filter((h) => h.id !== id));
    }
  }, []);

  const updateTechniqueStatus = useCallback(
    async (
      hobbyId: string,
      techniqueId: string,
      status: TechniqueStatus
    ): Promise<Hobby | null> => {
      try {
        const updated = await store.updateTechniqueStatus(
          hobbyId,
          techniqueId,
          status
        );

        if (mountedRef.current) {
          setHobbies((prev) =>
            prev.map((h) => (h.id === hobbyId ? updated : h))
          );
        }

        return updated;
      } catch {
        return null;
      }
    },
    []
  );

  const refreshHobbies = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  return {
    hobbies,
    loading,
    error,
    createHobby,
    deleteHobby,
    updateTechniqueStatus,
    refreshHobbies,
  };
}

// ─── Error message re-export ─────────────────────────────────────────────────
export { getErrorMessage };
