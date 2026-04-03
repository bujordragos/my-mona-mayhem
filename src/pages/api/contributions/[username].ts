import type { APIRoute } from "astro";

export const prerender = false;

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const REQUEST_TIMEOUT_MS = 8000;

type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

type NormalizedContributionDay = {
  date: string;
  count: number;
  color?: string;
};

type NormalizedContributionWeek = {
  days: NormalizedContributionDay[];
};

const contributionCache = new Map<string, CacheEntry>();

const baseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control":
    "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
};

const createJsonResponse = (
  body: unknown,
  status: number,
  extraHeaders?: HeadersInit,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...baseHeaders,
      ...(extraHeaders ?? {}),
    },
  });

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

const shouldBypassCache = (url: URL): boolean => {
  const refresh = url.searchParams.get("refresh")?.toLowerCase();
  return refresh === "1" || refresh === "true";
};

const createStaleResponse = (cached: CacheEntry): Response =>
  createJsonResponse(cached.data, 200, {
    Warning: "110 - Response is stale",
    "X-Cache": "STALE",
  });

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

const normalizePayload = (payload: unknown): unknown => {
  if (!isObject(payload)) {
    return payload;
  }

  const totalContributions = payload.total_contributions;
  const weeks = payload.weeks;
  if (typeof totalContributions !== "number" || !Array.isArray(weeks)) {
    return payload;
  }

  const colors = Array.isArray(payload.colors_full) ? payload.colors_full : [];
  const normalizedWeeks: NormalizedContributionWeek[] = weeks.map((week) => {
    if (!isObject(week)) {
      return { days: [] };
    }

    const firstDay = typeof week.first_day === "string" ? week.first_day : "";
    const firstDayUtc = new Date(`${firstDay}T00:00:00.000Z`);
    const rawDays = Array.isArray(week.contribution_days)
      ? week.contribution_days
      : [];

    const days = rawDays.flatMap((rawDay): NormalizedContributionDay[] => {
      if (!isObject(rawDay)) {
        return [];
      }

      const weekday = rawDay.weekday;
      const count = rawDay.count;
      const level = rawDay.level;
      if (typeof weekday !== "number" || typeof count !== "number") {
        return [];
      }

      const date =
        Number.isNaN(firstDayUtc.getTime())
          ? ""
          : toDateOnly(
              new Date(
                Date.UTC(
                  firstDayUtc.getUTCFullYear(),
                  firstDayUtc.getUTCMonth(),
                  firstDayUtc.getUTCDate() + weekday,
                ),
              ),
            );

      if (!date) {
        return [];
      }

      const color =
        typeof level === "number" &&
        level >= 0 &&
        level < colors.length &&
        typeof colors[level] === "string"
          ? colors[level]
          : undefined;

      return [{ date, count, ...(color ? { color } : {}) }];
    });

    return { days };
  });

  const contributions = normalizedWeeks.flatMap((week) => week.days);

  return {
    ...payload,
    total: totalContributions,
    contributions,
    weeks: normalizedWeeks,
  };
};

const trimCache = () => {
  if (contributionCache.size <= MAX_CACHE_ENTRIES) {
    return;
  }

  const oldestKey = contributionCache.keys().next().value;
  if (oldestKey) {
    contributionCache.delete(oldestKey);
  }
};

export const GET: APIRoute = async ({ params, url }) => {
  const username = params.username?.trim();
  if (!username || !USERNAME_PATTERN.test(username)) {
    return createJsonResponse({ error: "Invalid GitHub username." }, 400, {
      "X-Cache": "SKIP",
    });
  }

  const cacheKey = username.toLowerCase();
  const now = Date.now();
  const cached = contributionCache.get(cacheKey);
  const bypassCache = shouldBypassCache(url);

  if (!bypassCache && cached && cached.expiresAt > now) {
    return createJsonResponse(cached.data, 200, { "X-Cache": "HIT" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(
      `https://github.com/${encodeURIComponent(username)}.contribs`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "mona-mayhem/1.0",
        },
        signal: controller.signal,
      },
    );

    if (upstreamResponse.status === 404) {
      return createJsonResponse({ error: "GitHub user not found." }, 404, {
        "X-Cache": "MISS",
      });
    }

    if (!upstreamResponse.ok) {
      if (cached) {
        return createStaleResponse(cached);
      }

      return createJsonResponse(
        {
          error: "GitHub upstream request failed.",
          upstreamStatus: upstreamResponse.status,
        },
        502,
        { "X-Cache": "MISS" },
      );
    }

    let payload: unknown;
    try {
      payload = await upstreamResponse.json();
    } catch {
      if (cached) {
        return createStaleResponse(cached);
      }

      return createJsonResponse(
        { error: "Invalid JSON received from GitHub." },
        502,
        { "X-Cache": "MISS" },
      );
    }

    const normalizedPayload = normalizePayload(payload);

    contributionCache.set(cacheKey, {
      data: normalizedPayload,
      expiresAt: now + CACHE_TTL_MS,
    });
    trimCache();

    return createJsonResponse(normalizedPayload, 200, { "X-Cache": "MISS" });
  } catch (error) {
    if (cached) {
      return createStaleResponse(cached);
    }

    if (isAbortError(error)) {
      return createJsonResponse(
        { error: "GitHub upstream request timed out." },
        504,
        { "X-Cache": "MISS" },
      );
    }

    return createJsonResponse(
      { error: "Failed to fetch contributions from GitHub." },
      502,
      {
        "X-Cache": "MISS",
      },
    );
  } finally {
    clearTimeout(timeout);
  }
};
