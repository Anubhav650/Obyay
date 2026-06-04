import type { GoalLevel, Hobby, Resource, Technique } from '../types/models';

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Error Types ─────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | 'NOT_A_HOBBY'
  | 'AI_INVALID_OUTPUT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;

  constructor(code: ApiErrorCode, message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ─── Response Types ──────────────────────────────────────────────────────────

export interface PlanResponse {
  hobby: string;
  level: GoalLevel;
  summary: string;
  techniques: Array<{
    id: string;
    name: string;
    description: string;
    whyItMatters: string;
    order: number;
    searchQuery: string;
  }>;
}

export interface ResourcesResponse {
  resources: Resource[];
}

// ─── Fetch Helper ────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { method = 'GET', body, timeoutMs = 10000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: { error?: string; code?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Response body not JSON
      }

      const code = mapErrorCode(errorData.code, response.status);
      throw new ApiError(
        code,
        errorData.error || `Server error: ${response.status}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out');
    }

    if (error instanceof TypeError) {
      throw new ApiError('NETWORK_ERROR', 'Network request failed');
    }

    throw new ApiError('UNKNOWN', 'An unexpected error occurred');
  }
}

function mapErrorCode(code: string | undefined, status: number): ApiErrorCode {
  if (code === 'NOT_A_HOBBY') return 'NOT_A_HOBBY';
  if (code === 'AI_INVALID_OUTPUT') return 'AI_INVALID_OUTPUT';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function generatePlan(
  hobby: string,
  level: GoalLevel
): Promise<PlanResponse> {
  return apiFetch<PlanResponse>('/api/plan', {
    method: 'POST',
    body: { hobby, level },
    timeoutMs: 30000, // Plan generation can take longer
  });
}

export async function fetchResources(
  query: string
): Promise<ResourcesResponse> {
  const encoded = encodeURIComponent(query);
  return apiFetch<ResourcesResponse>(`/api/resources?q=${encoded}`, {
    timeoutMs: 10000,
  });
}

// ─── Error Message Helper ────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NOT_A_HOBBY':
        return "That doesn't look like a hobby — try something like 'ukulele' or 'watercolor painting'";
      case 'AI_INVALID_OUTPUT':
        return "Couldn't build a plan for that — try rewording your hobby";
      case 'NETWORK_ERROR':
        return "Can't reach the server — check your connection";
      case 'TIMEOUT':
        return 'The request took too long — try again';
      case 'SERVER_ERROR':
        return 'Something went wrong on our end — try again in a moment';
      default:
        return 'Something went wrong — please try again';
    }
  }
  return 'Something went wrong — please try again';
}
