import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Container, Stack, Text, Title } from "@mantine/core";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createMatch } from "../../api/matches";
import GamesDuel from "../../components/GamesDuel";
import Header from "../../components/Header";
import MatchLikesTable from "../../components/MatchLikesTable";
import Stage from "../../components/Stage";
import Winner from "../../components/Winner";
import { buildMatchSystem } from "../../config/matchSystem";
import { GameItem, PlatformSlug, matchPlatformsBySlug } from "../../config/matchPlatforms";

type MatchProps = {
  platform: PlatformSlug;
};

const ALLOWED_SIZES = [16, 32, 64, 128] as const;
const STORAGE_VERSION = 1;

type TournamentState = {
  stageIndex: number;
  stagePairs: Array<[number, number]>;
  pairIndex: number;
  stageWinners: number[];
  stageLosers: number[];
  winnersPool: number[];
  losersPool: number[];
  lastWinnerId: number | null;
  championId: number | null;
  history: string[];
  stageStepsByIndex: Record<number, { type: "winners" | "losers" | "final"; steps: Array<[number, number]> }>;
};

type MatchGameEntry = {
  id: number;
  likes: number;
};

type PersistedMatchSession = {
  id: string;
  platform: PlatformSlug;
  author: string | null;
  champion: number | null;
  gamesList: MatchGameEntry[];
  match: {
    stage: number;
    step: number;
    left: number;
  };
  history: {
    stages: Record<number, { type: "winners" | "losers" | "final"; steps: Array<[number, number]> }>;
  };
  runtime: {
    version: number;
    platform: PlatformSlug;
    count: number;
    winnerModalClosed: boolean;
    tournament: TournamentState;
    updatedAt: string;
  };
};

type LegacyStoredMatchSession = {
  version: number;
  platform: PlatformSlug;
  matchId: string;
  count: number;
  tournament: Omit<TournamentState, "stageStepsByIndex"> & {
    stageStepsByIndex?: Record<number, { type: "winners" | "losers" | "final"; steps: Array<[number, number]> }>;
  };
  winnerModalClosed: boolean;
  updatedAt: string;
};

function createMatchId(): string {
  const alphabet = "0123456789abcdef";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function readStoredMatch(storageKey: string): PersistedMatchSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMatchSession | LegacyStoredMatchSession;
    if (!parsed) return null;

    if ("runtime" in parsed && parsed.runtime?.version === STORAGE_VERSION && parsed.runtime.tournament) {
      return parsed;
    }

    if ("version" in parsed && parsed.version === STORAGE_VERSION && parsed.tournament && parsed.matchId) {
      const tournament = parsed.tournament;
      const stage = tournament.stageIndex + 1;
      const step = tournament.stagePairs.length === 0 ? 0 : Math.min(tournament.pairIndex + 1, tournament.stagePairs.length);
      const left = tournament.championId !== null ? 1 : Math.max(0, (tournament.stagePairs.length - tournament.pairIndex) * 2);

      return {
        id: parsed.matchId,
        platform: parsed.platform,
        author: null,
        champion: tournament.championId,
        gamesList: Array.from(new Set([...tournament.winnersPool, ...tournament.losersPool])).map((id) => ({
          id,
          likes: 0,
        })),
        match: { stage, step, left },
        history: {
          stages: {
            [stage]: {
              type: (parsed.tournament.stageStepsByIndex?.[parsed.tournament.stageIndex]?.type ?? "winners"),
              steps: parsed.tournament.stagePairs,
            },
          },
        },
        runtime: {
          version: STORAGE_VERSION,
          platform: parsed.platform,
          count: parsed.count,
          winnerModalClosed: parsed.winnerModalClosed,
          tournament: {
            ...tournament,
            stageStepsByIndex:
              tournament.stageStepsByIndex ?? {
                [tournament.stageIndex]: {
                  type: (tournament.stageIndex === 0 ? "winners" : "losers") as "winners" | "losers" | "final",
                  steps: tournament.stagePairs,
                },
              },
          },
          updatedAt: parsed.updatedAt,
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}

function shuffleIds(ids: number[]): number[] {
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pairParticipants(ids: number[]): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < ids.length; i += 2) {
    const left = ids[i];
    const right = ids[i + 1];
    if (left !== undefined && right !== undefined) {
      pairs.push([left, right]);
    }
  }
  return pairs;
}

function getParticipantsForStage(
  stageBracket: "winners" | "losers" | "final",
  winnersPool: number[],
  losersPool: number[]
): number[] {
  if (stageBracket === "winners") return winnersPool;
  if (stageBracket === "losers") return losersPool;
  return [winnersPool[0], losersPool[0]].filter((id): id is number => typeof id === "number");
}

function getShuffledParticipants(games: GameItem[], count: number): number[] {
  return shuffleIds(games.map((game) => game.id)).slice(0, count);
}

function createInitialTournament(ids: number[], initialType: "winners" | "losers" | "final" = "winners"): TournamentState {
  const initialPairs = pairParticipants(ids);
  return {
    stageIndex: 0,
    stagePairs: initialPairs,
    pairIndex: 0,
    stageWinners: [],
    stageLosers: [],
    winnersPool: ids,
    losersPool: [],
    lastWinnerId: null,
    championId: null,
    history: ["Турнир начат: сформированы пары первого этапа."],
    stageStepsByIndex: {
      0: { type: initialType, steps: initialPairs },
    },
  };
}

function formatGamesWord(value: number): string {
  const abs = Math.abs(value);
  const lastTwo = abs % 100;
  const last = abs % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "игр";
  }
  if (last === 1) {
    return "игра";
  }
  if (last >= 2 && last <= 4) {
    return "игры";
  }
  return "игр";
}

function getGamesLeftInWholeMatch(
  tournament: TournamentState,
  currentStageBracket: "winners" | "losers" | "final" | undefined
): number {
  if (tournament.championId !== null) {
    return 1;
  }

  const aliveBeforeCurrentStep = tournament.winnersPool.length + tournament.losersPool.length;
  const eliminationPerPlayedPair =
    currentStageBracket === "losers" || currentStageBracket === "final" ? 1 : 0;
  const eliminatedInCurrentStage = tournament.pairIndex * eliminationPerPlayedPair;

  return Math.max(1, aliveBeforeCurrentStep - eliminatedInCurrentStage);
}

function buildPersistedPayload(params: {
  matchId: string;
  platform: PlatformSlug;
  author: string | null;
  tournament: TournamentState;
  count: number;
  winnerModalClosed: boolean;
  gameLikes: Record<number, number>;
}): PersistedMatchSession {
  const { matchId, platform, author, tournament, count, winnerModalClosed, gameLikes } = params;
  const stageEntries = Object.entries(tournament.stageStepsByIndex) as Array<
    [string, { type: "winners" | "losers" | "final"; steps: Array<[number, number]> }]
  >;
  const stage = tournament.stageIndex + 1;
  const step = tournament.stagePairs.length === 0 ? 0 : Math.min(tournament.pairIndex + 1, tournament.stagePairs.length);
  const left = tournament.championId !== null ? 1 : Math.max(0, (tournament.stagePairs.length - tournament.pairIndex) * 2);
  const gamesList = Array.from(
    new Set(
      stageEntries
        .map(([, stageData]) => stageData)
        .flatMap((stageItem) => stageItem.steps)
        .flatMap((pair) => pair)
    )
  ).map((id) => ({ id, likes: gameLikes[id] ?? 0 }));

  return {
    id: matchId,
    platform,
    author,
    champion: tournament.championId,
    gamesList,
    match: {
      stage,
      step,
      left,
    },
    history: {
      stages: stageEntries.reduce<
        Record<number, { type: "winners" | "losers" | "final"; steps: Array<[number, number]> }>
      >((acc, [index, stageData]) => {
        acc[Number(index) + 1] = stageData;
        return acc;
      }, {}),
    },
    runtime: {
      version: STORAGE_VERSION,
      platform,
      count,
      winnerModalClosed,
      tournament,
      updatedAt: new Date().toISOString(),
    },
  };
}

function Match({ platform }: MatchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ matchId?: string }>();
  const [searchParams] = useSearchParams();
  const tournamentConfig = matchPlatformsBySlug[platform];
  const { name, games, assetFolder } = tournamentConfig;
  const generatedMatchIdRef = useRef(createMatchId());
  const matchId = params.matchId ?? generatedMatchIdRef.current;
  const storageKey = `gamesmatch.match.${platform}.${matchId}`;
  const availableSizes = ALLOWED_SIZES.filter((size) => size <= games.length);
  const fallbackSize = availableSizes.includes(64) ? 64 : availableSizes[availableSizes.length - 1] ?? 16;
  const sizeFromUrl = Number(searchParams.get("size"));
  const requestedCount = availableSizes.includes(sizeFromUrl as (typeof ALLOWED_SIZES)[number]) ? sizeFromUrl : fallbackSize;
  const [count, setCount] = useState(requestedCount);
  const plan = useMemo(() => buildMatchSystem(count), [count]);
  const [winnerModalClosed, setWinnerModalClosed] = useState(false);
  const [author, setAuthor] = useState<string | null>(null);
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);
  const [gameLikes, setGameLikes] = useState<Record<number, number>>({});

  const [tournament, setTournament] = useState(() =>
    createInitialTournament(getShuffledParticipants(games, requestedCount), "winners")
  );

  useEffect(() => {
    if (!params.matchId) {
      navigate(`${tournamentConfig.route}/${matchId}${location.search}`, { replace: true });
    }
  }, [params.matchId, navigate, tournamentConfig.route, matchId, location.search]);

  useEffect(() => {
    setIsSessionHydrated(false);
    const stored = readStoredMatch(storageKey);
    if (stored && stored.runtime.platform === platform && stored.id === matchId) {
      const storedCount =
        ALLOWED_SIZES.includes(stored.runtime.count as (typeof ALLOWED_SIZES)[number]) && stored.runtime.count <= games.length
          ? stored.runtime.count
          : requestedCount;
      setCount(storedCount);
      setWinnerModalClosed(stored.runtime.winnerModalClosed);
      setAuthor(stored.author);
      setTournament(stored.runtime.tournament);
      setGameLikes(Object.fromEntries(stored.gamesList.map(({ id, likes }) => [id, likes])));
      setIsSessionHydrated(true);
      return;
    }

    setCount(requestedCount);
    setWinnerModalClosed(false);
    setAuthor(null);
    setGameLikes({});
    setTournament(createInitialTournament(getShuffledParticipants(games, requestedCount), "winners"));
    setIsSessionHydrated(true);
  }, [games, requestedCount, storageKey, platform, matchId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSessionHydrated) return;
    const payload = buildPersistedPayload({
      matchId,
      platform,
      author,
      tournament,
      count,
      winnerModalClosed,
      gameLikes,
    });
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [storageKey, platform, matchId, count, tournament, winnerModalClosed, isSessionHydrated, gameLikes, author]);

  const handleSaveRun = useCallback(
    async (authorName: string) => {
      const payload = buildPersistedPayload({
        matchId,
        platform,
        author: authorName,
        tournament,
        count,
        winnerModalClosed,
        gameLikes,
      });
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setAuthor(authorName);
      await createMatch(payload);
    },
    [matchId, platform, tournament, count, winnerModalClosed, gameLikes, storageKey]
  );

  const currentStage = plan.stages[tournament.stageIndex];
  const currentPair = tournament.stagePairs[tournament.pairIndex] ?? null;
  const currentPairNumber =
    tournament.stagePairs.length === 0 ? 0 : Math.min(tournament.pairIndex + 1, tournament.stagePairs.length);
  const gamesLeftInMatch = getGamesLeftInWholeMatch(tournament, currentStage?.bracket);
  const championTitle = games.find((item) => item.id === tournament.championId)?.title;
  const isWinnerModalOpen = tournament.championId !== null && !winnerModalClosed;
  const matchTitle = `Матч ${name} (${count} ${formatGamesWord(count)})`;

  const likesRanking = useMemo(() => {
    const stageSteps = Object.values(tournament.stageStepsByIndex) as Array<{
      type: "winners" | "losers" | "final";
      steps: Array<[number, number]>;
    }>;
    const ids = new Set(stageSteps.flatMap((stage) => stage.steps).flatMap((pair) => pair));

    return Array.from(ids)
      .map((id) => ({
        id,
        title: games.find((item) => item.id === id)?.title ?? String(id),
        likes: gameLikes[id] ?? 0,
      }))
      .sort((a, b) => b.likes - a.likes || a.title.localeCompare(b.title, "ru"));
  }, [tournament.stageStepsByIndex, gameLikes, games]);

  const pickWinner = (winnerId: number) => {
    setGameLikes((prev) => ({
      ...prev,
      [winnerId]: (prev[winnerId] ?? 0) + 1,
    }));

    setTournament((prev) => {
      if (prev.championId !== null) return prev;
      const activeStage = plan.stages[prev.stageIndex];
      if (!activeStage) return prev;

      const activePair = prev.stagePairs[prev.pairIndex];
      if (!activePair) return prev;

      const loserId = activePair[0] === winnerId ? activePair[1] : activePair[0];
      const stageWinners = [...prev.stageWinners, winnerId];
      const stageLosers = [...prev.stageLosers, loserId];
      const nextPairIndex = prev.pairIndex + 1;
      const stageFinished = nextPairIndex >= prev.stagePairs.length;

      if (!stageFinished) {
        return {
          ...prev,
          pairIndex: nextPairIndex,
          stageWinners,
          stageLosers,
          lastWinnerId: winnerId,
        };
      }

      let winnersPool = prev.winnersPool;
      let losersPool = prev.losersPool;
      let championId = prev.championId;

      if (activeStage.bracket === "winners") {
        winnersPool = stageWinners;
        losersPool = [...prev.losersPool, ...stageLosers];
      } else if (activeStage.bracket === "losers") {
        losersPool = stageWinners;
      } else {
        championId = stageWinners[0] ?? null;
      }

      const stageNote = `Этап ${prev.stageIndex + 1} завершен. Сыграно пар: ${prev.stagePairs.length}.`;
      const winnerNote =
        championId !== null
          ? `Турнир завершен. Чемпион: ${games.find((item) => item.id === championId)?.title ?? championId}.`
          : `Последний победитель этапа: ${games.find((item) => item.id === winnerId)?.title ?? winnerId}.`;

      if (championId !== null) {
        return {
          ...prev,
          pairIndex: nextPairIndex,
          stageWinners,
          stageLosers,
          winnersPool,
          losersPool,
          championId,
          lastWinnerId: winnerId,
          history: [...prev.history, stageNote, winnerNote],
        };
      }

      const nextStageIndex = prev.stageIndex + 1;
      const nextStage = plan.stages[nextStageIndex];
      if (!nextStage) {
        return {
          ...prev,
          pairIndex: nextPairIndex,
          stageWinners,
          stageLosers,
          winnersPool,
          losersPool,
          championId,
          lastWinnerId: winnerId,
          history: [...prev.history, stageNote],
        };
      }

      const nextParticipants = getParticipantsForStage(nextStage.bracket, winnersPool, losersPool);
      const nextPairs = pairParticipants(shuffleIds(nextParticipants));

      return {
        ...prev,
        stageIndex: nextStageIndex,
        stagePairs: nextPairs,
        pairIndex: 0,
        stageWinners: [],
        stageLosers: [],
        winnersPool,
        losersPool,
        lastWinnerId: winnerId,
        championId,
        history: [...prev.history, stageNote, `Переход к этапу ${nextStageIndex + 1}.`],
        stageStepsByIndex: {
          ...prev.stageStepsByIndex,
          [nextStageIndex]: { type: nextStage.bracket, steps: nextPairs },
        },
      };
    });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Header
          title={matchTitle}
          headingOrder={3}
        />

        <Stage
          stage={currentStage}
          stageIndex={tournament.stageIndex}
          totalStages={plan.totalStages}
          currentPair={currentPairNumber}
          totalPairs={tournament.stagePairs.length}
          gamesLeft={gamesLeftInMatch}
        />

        {tournament.championId !== null && <MatchLikesTable ranking={likesRanking} />}

        {!tournament.championId && currentPair ? (
          <GamesDuel
            leftGameId={currentPair[0]}
            rightGameId={currentPair[1]}
            games={games}
            assetFolder={assetFolder}
            onPickLeft={() => pickWinner(currentPair[0])}
            onPickRight={() => pickWinner(currentPair[1])}
          />
        ) : !tournament.championId ? (
          <Card withBorder radius="md" padding="md">
            <Title order={2}>Этап завершен</Title>
            <Text c="dimmed">Пары текущего этапа сыграны, выполняется переход к следующему этапу.</Text>
          </Card>
        ) : null}

        <Winner
          isOpen={isWinnerModalOpen}
          championTitle={championTitle ?? String(tournament.championId)}
          onClose={() => setWinnerModalClosed(true)}
          onSave={handleSaveRun}
          onRestart={() => {
            setWinnerModalClosed(false);
            setAuthor(null);
            setGameLikes({});
            setTournament(createInitialTournament(getShuffledParticipants(games, count), "winners"));
          }}
        />
      </Stack>
    </Container>
  );
}

export default Match;
