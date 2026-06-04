import { useState, useEffect, useCallback, useRef } from 'react';
import type { Technique, Resource } from '../types/models';
import { fetchResources } from '../api/client';
import { updateTechniqueResources } from '../store/hobbyStore';

interface UseTechniqueResourcesReturn {
  resources: Resource[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTechniqueResources(
  hobbyId: string,
  technique: Technique
): UseTechniqueResourcesReturn {
  const [resources, setResources] = useState<Resource[] | null>(
    technique.resources
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const doFetch = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchResources(technique.searchQuery);
      const fetched = result.resources;

      // Cache in store
      await updateTechniqueResources(hobbyId, technique.id, fetched);

      if (mountedRef.current) {
        setResources(fetched);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to load videos');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [hobbyId, technique.id, technique.searchQuery]);

  // Auto-fetch if resources are null (not yet fetched)
  useEffect(() => {
    if (technique.resources !== null) {
      setResources(technique.resources);
      return;
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      doFetch();
    }
  }, [technique.resources, doFetch]);

  const refetch = useCallback(() => {
    fetchedRef.current = true;
    doFetch();
  }, [doFetch]);

  return { resources, loading, error, refetch };
}
