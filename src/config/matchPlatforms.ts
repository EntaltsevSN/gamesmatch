import { dendyGames } from "../data/dendy";
import { segaGenesisGames } from "../data/sega-genesis";
import { ps1Games } from "../data/ps1";
import { ps2Games } from "../data/ps2";
import { ps3Games } from "../data/ps3";
import { ps4Games } from "../data/ps4";
import { ps5Games } from "../data/ps5";

export type GameItem = {
  id: number;
  title: string;
  image: string;
};

export type PlatformSlug = "dendy" | "sega-genesis" | "ps1" | "ps2" | "ps3" | "ps4" | "ps5";

export type MatchPlatform = {
  slug: PlatformSlug;
  name: string;
  route: `/mathes/${PlatformSlug}`;
  title: string;
  subtitle: string;
  games: GameItem[];
  assetFolder: string;
  logoPath: string;
};

export const matchPlatforms: MatchPlatform[] = [
  {
    slug: "dendy",
    name: "Dendy",
    route: "/mathes/dendy",
    title: "Dendy games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: dendyGames,
    assetFolder: "famicom",
    logoPath: "/src/assets/images/dendy-logo.png",
  },
  {
    slug: "sega-genesis",
    name: "Sega Genesis",
    route: "/mathes/sega-genesis",
    title: "Sega Genesis games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: segaGenesisGames,
    assetFolder: "sega-genesis",
    logoPath: "/src/assets/images/sega-mega-drive-logo.png",
  },
  {
    slug: "ps1",
    name: "PS1",
    route: "/mathes/ps1",
    title: "PS1 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps1Games,
    assetFolder: "ps1",
    logoPath: "/src/assets/images/ps1-logo.png",
  },
  {
    slug: "ps2",
    name: "PS2",
    route: "/mathes/ps2",
    title: "PS2 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps2Games,
    assetFolder: "ps2",
    logoPath: "/src/assets/images/ps2-logo.png",
  },
  {
    slug: "ps3",
    name: "PS3",
    route: "/mathes/ps3",
    title: "PS3 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps3Games,
    assetFolder: "ps3",
    logoPath: "/src/assets/images/ps3-logo.png",
  },
  {
    slug: "ps4",
    name: "PS4",
    route: "/mathes/ps4",
    title: "PS4 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps4Games,
    assetFolder: "ps4",
    logoPath: "/src/assets/images/ps4-logo.png",
  },
  {
    slug: "ps5",
    name: "PS5",
    route: "/mathes/ps5",
    title: "PS5 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps5Games,
    assetFolder: "ps5",
    logoPath: "/src/assets/images/ps5-logo.png",
  },
];

export const matchPlatformsBySlug: Record<PlatformSlug, MatchPlatform> = {
  dendy: matchPlatforms[0],
  "sega-genesis": matchPlatforms[1],
  ps1: matchPlatforms[2],
  ps2: matchPlatforms[3],
  ps3: matchPlatforms[4],
  ps4: matchPlatforms[5],
  ps5: matchPlatforms[6],
};