import React from "react";
import type { StagePlan } from "../config/matchSystem";

type StageProps = {
  stage: StagePlan;
  stageIndex: number;
  totalStages: number;
  currentPair: number;
  totalPairs: number;
};

function getBracketLabel(stage: StagePlan): string {
  if (stage.bracket === "winners") return "Сетка виннеров";
  if (stage.bracket === "losers") return "Сетка лузеров";
  return "Финальная стадия";
}

function getStageDescription(stage: StagePlan): string {
  if (stage.bracket === "winners") {
    return `${stage.teamsIn} команд играют ${stage.matches} матчей. ${stage.winnersOut} проходят дальше, ${stage.dropsToLosers} переходят в лузеры.`;
  }
  if (stage.bracket === "losers") {
    return `${stage.teamsIn} команд играют ${stage.matches} матчей. ${stage.winnersOut} остаются в борьбе, ${stage.eliminated} вылетают из турнира.`;
  }
  return `${stage.teamsIn} команды играют ${stage.matches} матч. Победитель становится чемпионом.`;
}

function Stage({ stage, stageIndex, totalStages, currentPair, totalPairs }: StageProps) {
  const title = `Этап ${stageIndex + 1} из ${totalStages}`;
  const description = getStageDescription(stage);
  const matchCounter = `Пара: ${currentPair} из ${totalPairs}`;
  const remainingCounter = `После этапа останется: ${stage.winnersOut}`;

  return (
    <section className="status-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="meta">
        <span>{getBracketLabel(stage)}</span>
        <span>{matchCounter}</span>
        <span>{remainingCounter}</span>
      </div>
    </section>
  );
}

export default Stage;
