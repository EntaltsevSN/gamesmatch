import React, { useMemo, useState } from "react";
import GamesDuel from "../../components/GamesDuel";
import Header from "../../components/Header";
import History from "../../components/History";
import Stage from "../../components/Stage";
import Winner from "../../components/Winner";
import { buildMatchSystem } from "../../config/matchSystem";
import { ps1Games } from "../../data/ps1";
import { ps1Games as segaGenesisGames } from "../../data/sega-genesis";
import { ps1Games as famicomGames } from "../../data/famicom";

type MatchProps = {
  platform: "ps1" | "sega-genesis" | "famicom";
};

type GameItem = {
  id: number;
  title: string;
  image: string;
};

const TOURNAMENTS: Record<
  MatchProps["platform"],
  { title: string; subtitle: string; games: GameItem[]; assetFolder: string }
> = {
  ps1: {
    title: "PS1 games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: ps1Games,
    assetFolder: "ps1",
  },
  "sega-genesis": {
    title: "Sega Genesis games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: segaGenesisGames,
    assetFolder: "sega-genesis",
  },
  famicom: {
    title: "Famicom games match",
    subtitle: "Выбери победителя в каждом матче и пройди весь турнир до финала.",
    games: famicomGames,
    assetFolder: "famicom",
  },
};

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
};

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

function createInitialTournament(ids: number[]): TournamentState {
  return {
    stageIndex: 0,
    stagePairs: pairParticipants(ids),
    pairIndex: 0,
    stageWinners: [],
    stageLosers: [],
    winnersPool: ids,
    losersPool: [],
    lastWinnerId: null,
    championId: null,
    history: ["Турнир начат: сформированы пары первого этапа."],
  };
}

function Match({ platform }: MatchProps) {
  const tournamentConfig = TOURNAMENTS[platform];
  const { title, subtitle, games, assetFolder } = tournamentConfig;
  const count = Math.min(64, games.length - (games.length % 2));
  const plan = useMemo(() => buildMatchSystem(count), [count]);
  const [winnerModalClosed, setWinnerModalClosed] = useState(false);

  const [tournament, setTournament] = useState(() => createInitialTournament(getShuffledParticipants(games, count)));

  const currentStage = plan.stages[tournament.stageIndex];
  const currentPair = tournament.stagePairs[tournament.pairIndex] ?? null;
  const currentPairNumber =
    tournament.stagePairs.length === 0 ? 0 : Math.min(tournament.pairIndex + 1, tournament.stagePairs.length);
  const championTitle = games.find((item) => item.id === tournament.championId)?.title;
  const isWinnerModalOpen = tournament.championId !== null && !winnerModalClosed;

  const pickWinner = (winnerId: number) => {
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
      };
    });
  };

  return (
    <main className="app">
      <Header
        showHomeLink
        title={title}
        subtitle={subtitle}
      />

      <Stage
        stage={currentStage}
        stageIndex={tournament.stageIndex}
        totalStages={plan.totalStages}
        currentPair={currentPairNumber}
        totalPairs={tournament.stagePairs.length}
      />

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
        <section className="status-card">
          <h2>Этап завершен</h2>
          <p>Пары текущего этапа сыграны, выполняется переход к следующему этапу.</p>
        </section>
      ) : null}

      <History items={tournament.history} />
      <Winner
        isOpen={isWinnerModalOpen}
        championTitle={championTitle ?? String(tournament.championId)}
        onClose={() => setWinnerModalClosed(true)}
        onRestart={() => {
          setWinnerModalClosed(false);
          setTournament(createInitialTournament(getShuffledParticipants(games, count)));
        }}
      />
    </main>
  );
}

export default Match;
