import { PlatformSlug } from "../config/matchPlatforms";

export type StoredMatchGameEntry = {
  id: number;
  likes: number;
};

export type StoredMatch = {
  id: string;
  platform: PlatformSlug;
  author: string | null;
  champion: number | null;
  gamesList: StoredMatchGameEntry[];
};

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function getMatches(): Promise<StoredMatch[]> {
  const res = await fetch(`${API_BASE}/api/matches`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function createMatch(payload: unknown) {
  const res = await fetch(`${API_BASE}/api/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
