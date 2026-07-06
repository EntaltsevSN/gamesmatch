import { StoredMatch } from "../api/matches";
import { PlatformSlug } from "../config/matchPlatforms";

export type GameRatingMetrics = {
  championCount: number;
  matchesPlayed: number;
  globalRating: number;
};

type GameKey = `${PlatformSlug}:${number}`;

function toGameKey(platform: PlatformSlug, id: number): GameKey {
  return `${platform}:${id}`;
}

export function aggregateMatchMetrics(matches: StoredMatch[]): Map<GameKey, GameRatingMetrics> {
  const metrics = new Map<GameKey, GameRatingMetrics>();

  const ensure = (key: GameKey): GameRatingMetrics => {
    const existing = metrics.get(key);
    if (existing) return existing;

    const created = { championCount: 0, matchesPlayed: 0, globalRating: 0 };
    metrics.set(key, created);
    return created;
  };

  for (const match of matches) {
    const platform = match.platform;

    if (match.champion != null) {
      const championMetrics = ensure(toGameKey(platform, match.champion));
      championMetrics.championCount += 1;
    }

    for (const entry of match.gamesList ?? []) {
      const entryMetrics = ensure(toGameKey(platform, entry.id));
      entryMetrics.matchesPlayed += 1;
      entryMetrics.globalRating += entry.likes ?? 0;
    }
  }

  return metrics;
}

export function compareRatingRows(
  a: GameRatingMetrics & { title: string },
  b: GameRatingMetrics & { title: string }
): number {
  if (b.globalRating !== a.globalRating) return b.globalRating - a.globalRating;
  if (b.championCount !== a.championCount) return b.championCount - a.championCount;
  if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
  return a.title.localeCompare(b.title, "ru");
}

export function getMetricsForGame(
  metrics: Map<GameKey, GameRatingMetrics>,
  platformSlug: PlatformSlug,
  id: number
): GameRatingMetrics {
  return metrics.get(toGameKey(platformSlug, id)) ?? { championCount: 0, matchesPlayed: 0, globalRating: 0 };
}
