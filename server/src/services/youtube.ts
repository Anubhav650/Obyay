import { LRUCache } from "lru-cache";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Resource {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSec: number;
  url: string;
}

export interface SearchResult {
  resources: Resource[];
  degraded?: boolean;
}

// ── Cache ──────────────────────────────────────────────────────────────────

const cache = new LRUCache<string, SearchResult>({
  max: 500,
  ttl: 24 * 60 * 60 * 1000, // 24 hours in ms
});

// ── ISO 8601 Duration Parser ───────────────────────────────────────────────

/**
 * Parses ISO 8601 duration strings (e.g. PT4M13S, PT1H2M3S, PT45S) → seconds.
 */
export const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
};

// ── YouTube API helpers ────────────────────────────────────────────────────

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const getApiKey = (): string => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }
  return key;
};

interface SearchListItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium?: { url: string; width: number; height: number };
    };
  };
}

interface VideoListItem {
  id: string;
  contentDetails: {
    duration: string;
  };
}

/**
 * Search for YouTube videos matching the query.
 * Returns up to `max` resources (default 3, max 5).
 * Uses an LRU cache (500 entries, 24h TTL) keyed by search query.
 * On quota exhaustion, returns { resources: [], degraded: true }.
 */
export const searchVideos = async (
  query: string,
  max: number = 3,
): Promise<SearchResult> => {
  const clampedMax = Math.min(Math.max(max, 1), 5);
  const cacheKey = `${query}|${clampedMax}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = getApiKey();

  try {
    // Step 1: Search for videos
    const searchParams = new URLSearchParams({
      key: apiKey,
      q: query,
      type: "video",
      maxResults: String(clampedMax),
      part: "snippet",
    });

    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?${searchParams.toString()}`,
    );

    if (searchResponse.status === 403) {
      // Quota exhaustion
      const degradedResult: SearchResult = {
        resources: [],
        degraded: true,
      };
      return degradedResult;
    }

    if (!searchResponse.ok) {
      throw new Error(
        `YouTube search API returned ${searchResponse.status}: ${searchResponse.statusText}`,
      );
    }

    const searchData = (await searchResponse.json()) as {
      items?: SearchListItem[];
    };
    const items = searchData.items || [];

    if (items.length === 0) {
      const emptyResult: SearchResult = { resources: [] };
      cache.set(cacheKey, emptyResult);
      return emptyResult;
    }

    // Step 2: Get video durations
    const videoIds = items.map((item) => item.id.videoId).join(",");
    const videoParams = new URLSearchParams({
      key: apiKey,
      id: videoIds,
      part: "contentDetails",
    });

    const videoResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?${videoParams.toString()}`,
    );

    if (videoResponse.status === 403) {
      const degradedResult: SearchResult = {
        resources: [],
        degraded: true,
      };
      return degradedResult;
    }

    if (!videoResponse.ok) {
      throw new Error(
        `YouTube videos API returned ${videoResponse.status}: ${videoResponse.statusText}`,
      );
    }

    const videoData = (await videoResponse.json()) as {
      items?: VideoListItem[];
    };
    const videoItems = videoData.items || [];

    // Build a duration map by videoId
    const durationMap = new Map<string, number>();
    for (const v of videoItems) {
      durationMap.set(v.id, parseISO8601Duration(v.contentDetails.duration));
    }

    // Step 3: Map to Resource type
    const resources: Resource[] = items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || "",
      durationSec: durationMap.get(item.id.videoId) || 0,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    const result: SearchResult = { resources };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    // Check if it's a quota/403 error we missed
    if (err instanceof Error && err.message.includes("403")) {
      return { resources: [], degraded: true };
    }
    throw err;
  }
};
