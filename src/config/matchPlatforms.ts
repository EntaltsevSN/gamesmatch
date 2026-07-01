import { ps1Games } from "../data/ps1";
import * as segaGenesisData from "../data/sega-genesis";
import { famicomGames } from "../data/famicom";
import { ps2Games } from "../data/ps2";
import { ps5Games } from "../data/ps5";

export type GameItem = {
  id: number;
  title: string;
  image: string;
};

export type PlatformSlug = "famicom" | "sega-genesis" | "ps1" | "ps2" | "ps5";

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
    slug: "famicom",
    name: "Famicom",
    route: "/famicom",
    title: "Famicom games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: famicomGames,
    assetFolder: "famicom",
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
    slug: "ps1",
    name: "PS1",
    route: "/ps1",
    title: "PS1 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps1Games,
    assetFolder: "ps1",
  },
  {
    slug: "ps2",
    name: "PS2",
    route: "/ps2",
    title: "PS2 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps2Games,
    assetFolder: "ps2",
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
  famicom: matchPlatforms[0],
  "sega-genesis": matchPlatforms[1],
  ps1: matchPlatforms[2],
  ps2: matchPlatforms[3],
  ps5: matchPlatforms[4],
};