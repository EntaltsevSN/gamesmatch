import { dendyGames } from "../data/dendy";
import { segaGenesisGames } from "../data/sega-genesis";
import { gbGames } from "../data/gb";
import { snesGames } from "../data/snes";
import { ps1Games } from "../data/ps1";
import { gbcGames } from "../data/gbc";
import { ps2Games } from "../data/ps2";
import { gbaGames } from "../data/gba";
import { ps3Games } from "../data/ps3";
import { ps4Games } from "../data/ps4";
import { ps5Games } from "../data/ps5";

export type GameItem = {
  id: number;
  title: string;
  image: string;
};

export type PlatformSlug = "dendy" | "sega-genesis" | "gb" | "snes" | "ps1" | "gbc" | "ps2" | "gba" | "ps3" | "ps4" | "ps5";

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
    logoPath: "dendy-logo.png",
  },
  {
    slug: "sega-genesis",
    name: "Sega Genesis",
    route: "/mathes/sega-genesis",
    title: "Sega Genesis games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: segaGenesisGames,
    assetFolder: "sega-genesis",
    logoPath: "sega-mega-drive-logo.png",
  },
  {
    slug: "gb",
    name: "Game Boy",
    route: "/mathes/gb",
    title: "Game Boy games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: gbGames,
    assetFolder: "gb",
    logoPath: "gb-logo.png",
  },
  {
    slug: "snes",
    name: "SNES",
    route: "/mathes/snes",
    title: "SNES games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: snesGames,
    assetFolder: "snes",
    logoPath: "snes-logo.png",
  },
  {
    slug: "ps1",
    name: "PS1",
    route: "/mathes/ps1",
    title: "PS1 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps1Games,
    assetFolder: "ps1",
    logoPath: "ps1-logo.png",
  },
  {
    slug: "gbc",
    name: "Game Boy Color",
    route: "/mathes/gbc",
    title: "Game Boy Color games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: gbcGames,
    assetFolder: "gbc",
    logoPath: "gbc-logo.png",
  },
  {
    slug: "ps2",
    name: "PS2",
    route: "/mathes/ps2",
    title: "PS2 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps2Games,
    assetFolder: "ps2",
    logoPath: "ps2-logo.png",
  },
  {
    slug: "gba",
    name: "Game Boy Advance",
    route: "/mathes/gba",
    title: "Game Boy Advance games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: gbaGames,
    assetFolder: "gba",
    logoPath: "gba-logo.png",
  },
  {
    slug: "ps3",
    name: "PS3",
    route: "/mathes/ps3",
    title: "PS3 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps3Games,
    assetFolder: "ps3",
    logoPath: "ps3-logo.png",
  },
  {
    slug: "ps4",
    name: "PS4",
    route: "/mathes/ps4",
    title: "PS4 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps4Games,
    assetFolder: "ps4",
    logoPath: "ps4-logo.png",
  },
  {
    slug: "ps5",
    name: "PS5",
    route: "/mathes/ps5",
    title: "PS5 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps5Games,
    assetFolder: "ps5",
    logoPath: "ps5-logo.png",
  },
];

export const matchPlatformsBySlug: Record<PlatformSlug, MatchPlatform> = {
  dendy: matchPlatforms[0],
  "sega-genesis": matchPlatforms[1],
  gb: matchPlatforms[2],
  snes: matchPlatforms[3],
  ps1: matchPlatforms[4],
  gbc: matchPlatforms[5],
  ps2: matchPlatforms[6],
  gba: matchPlatforms[7],
  ps3: matchPlatforms[8],
  ps4: matchPlatforms[9],
  ps5: matchPlatforms[10],
};