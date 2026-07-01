import { ps1Games } from "../data/ps1";
import * as segaGenesisData from "../data/sega-genesis";
import { famicomGames } from "../data/famicom";
import { ps5Games } from "../data/ps5";

export type GameItem = {
  id: number;
  title: string;
  image: string;
};

export type PlatformSlug = "ps1" | "sega-genesis" | "famicom" | "ps5";

export type MatchPlatform = {
  slug: PlatformSlug;
  name: string;
  route: `/${PlatformSlug}`;
  title: string;
  subtitle: string;
  games: GameItem[];
  assetFolder: string;
};

const segaGenesisGames = (
  segaGenesisData as unknown as Record<string, GameItem[]>
)["segaGenesisGames"] ?? (segaGenesisData as unknown as Record<string, GameItem[]>)["ps1Games"] ?? [];

export const matchPlatforms: MatchPlatform[] = [
  {
    slug: "ps1",
    name: "PS1",
    route: "/ps1",
    title: "PS1 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps1Games,
    assetFolder: "ps1",
  },
  {
    slug: "sega-genesis",
    name: "Sega Genesis",
    route: "/sega-genesis",
    title: "Sega Genesis games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: segaGenesisGames,
    assetFolder: "sega-genesis",
  },
  {
    slug: "famicom",
    name: "Famicom",
    route: "/famicom",
    title: "Famicom games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: famicomGames,
    assetFolder: "famicom",
  },
  {
    slug: "ps5",
    name: "PS5",
    route: "/ps5",
    title: "PS5 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps5Games,
    assetFolder: "ps5",
  },
];

export const matchPlatformsBySlug: Record<PlatformSlug, MatchPlatform> = {
  ps1: matchPlatforms[0],
  "sega-genesis": matchPlatforms[1],
  famicom: matchPlatforms[2],
  ps5: matchPlatforms[3],
};