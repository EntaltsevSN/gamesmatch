import React, { useMemo, useState } from "react";
import GamesDuel from "../../components/GamesDuel";
import Header from "../../components/Header";
import History from "../../components/History";
import Stage from "../../components/Stage";
import { buildMatchSystem } from "../../config/matchSystem";
import { ps1Games } from "../../data/ps1";

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

function Match() {
  const count = 64;
  const plan = useMemo(() => buildMatchSystem(count), [count]);
  const participants = useMemo(
    () => shuffleIds(ps1Games.slice(0, count).map((game) => game.id)),
    [count]
  );

  const [tournament, setTournament] = useState(() => {
    const initialStage = plan.stages[0];
    const initialPairs = pairParticipants(participants);
    return {
      stageIndex: 0,
      stagePairs: initialPairs,
      pairIndex: 0,
      stageWinners: [],
      stageLosers: [],
      winnersPool: participants,
      losersPool: [],
      lastWinnerId: null,
      championId: null,
      history: ["Турнир начат: сформированы пары первого этапа."],
    } as TournamentState;
  });

  const currentStage = plan.stages[tournament.stageIndex];
  const currentPair = tournament.stagePairs[tournament.pairIndex] ?? null;
  const currentPairNumber =
    tournament.stagePairs.length === 0 ? 0 : Math.min(tournament.pairIndex + 1, tournament.stagePairs.length);
  const lastWinnerTitle = ps1Games.find((item) => item.id === tournament.lastWinnerId)?.title;
  const championTitle = ps1Games.find((item) => item.id === tournament.championId)?.title;

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
          ? `Турнир завершен. Чемпион: ${ps1Games.find((item) => item.id === championId)?.title ?? championId}.`
          : `Последний победитель этапа: ${ps1Games.find((item) => item.id === winnerId)?.title ?? winnerId}.`;

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
        title="PS1 games match"
        subtitle="Выбери победителя в каждом матче и пройди весь турнир до финала."
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
          onPickLeft={() => pickWinner(currentPair[0])}
          onPickRight={() => pickWinner(currentPair[1])}
        />
      ) : (
        <section className="status-card">
          <h2>{tournament.championId ? "Турнир завершен" : "Этап завершен"}</h2>
          <p>
            {tournament.championId
              ? `Чемпион: ${championTitle ?? tournament.championId}.`
              : "Пары текущего этапа сыграны, выполняется переход к следующему этапу."}
          </p>
        </section>
      )}

      <section className="status-card">
        <h2>Текущее состояние матча</h2>
        <div className="meta">
          <span>Команд в чемпионате: {count}</span>
          <span>Текущий этап: {currentStage.id}</span>
          <span>Матчей на этапе: {currentStage.matches}</span>
          <span>Команд на входе этапа: {currentStage.teamsIn}</span>
          <span>Проходят дальше: {currentStage.winnersOut}</span>
          <span>Падают в лузеры: {currentStage.dropsToLosers}</span>
          <span>Вылетают: {currentStage.eliminated}</span>
          <span>Всего этапов: {plan.totalStages}</span>
          <span>Всего матчей: {plan.totalMatches}</span>
          <span>Розыгрыш пары: {currentPairNumber} из {tournament.stagePairs.length}</span>
        </div>
        <p className="match-result">
          {lastWinnerTitle
            ? `Последняя сыгранная пара: победитель ${lastWinnerTitle}.`
            : "Пока нет сыгранных пар. Выбери победителя в дуэли выше."}
        </p>
      </section>

      <History items={tournament.history.slice(-6)} />
    </main>
  );
}

export default Match;
