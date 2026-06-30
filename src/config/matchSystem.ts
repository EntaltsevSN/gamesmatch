export type BracketType = "winners" | "losers" | "final";

export type LosersRoundKind = "seed" | "merge" | "survival" | "final";

export type StagePlan = {
  id: string;
  stageNumber: number;
  title: string;
  bracket: BracketType;
  round: number;
  teamsIn: number;
  matches: number;
  winnersOut: number;
  dropsToLosers: number;
  eliminated: number;
  losersRoundKind?: LosersRoundKind;
};

export type MatchSystemPlan = {
  teamCount: number;
  winnersChampionCount: number;
  losersChampionCount: number;
  grandFinalists: number;
  championCount: number;
  totalStages: number;
  totalMatches: number;
  stages: StagePlan[];
};

function isPowerOfTwo(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

function createStage(
  stageNumber: number,
  title: string,
  bracket: BracketType,
  round: number,
  teamsIn: number,
  winnersOut: number,
  dropsToLosers: number,
  eliminated: number,
  losersRoundKind?: LosersRoundKind
): StagePlan {
  return {
    id: `stage${stageNumber}`,
    stageNumber,
    title,
    bracket,
    round,
    teamsIn,
    matches: Math.floor(teamsIn / 2),
    winnersOut,
    dropsToLosers,
    eliminated,
    losersRoundKind,
  };
}

/**
 * Строит этапы double-elimination системы:
 * - верхняя сетка (winners)
 * - нижняя сетка (losers) с корректным добором проигравших из winners
 * - внятный финал (grand final) между победителями winners/losers
 */
export function buildMatchSystem(teamCount: number): MatchSystemPlan {
  if (!Number.isInteger(teamCount)) {
    throw new Error("Количество команд должно быть целым числом.");
  }
  if (teamCount < 4) {
    throw new Error("Минимум 4 команды для корректной double-elimination сетки.");
  }
  if (!isPowerOfTwo(teamCount)) {
    throw new Error("Количество команд должно быть степенью двойки (например 32, 64, 128).");
  }

  const stages: StagePlan[] = [];
  const winnersRounds = Math.log2(teamCount);

  let stageNumber = 1;
  let winnersTeams = teamCount;
  let losersTeams = 0;

  // Winners round 1
  {
    const winnersOut = winnersTeams / 2;
    const dropsToLosers = winnersTeams / 2;
    stages.push(
      createStage(
        stageNumber++,
        "Этап 1 — Виннеры",
        "winners",
        1,
        winnersTeams,
        winnersOut,
        dropsToLosers,
        0
      )
    );
    winnersTeams = winnersOut;
    losersTeams = dropsToLosers;
  }

  // Losers seed round: первые проигравшие виннеров играют между собой.
  {
    const winnersOut = losersTeams / 2;
    const eliminated = losersTeams / 2;
    stages.push(
      createStage(
        stageNumber++,
        "Этап 2 — Лузеры (посев)",
        "losers",
        1,
        losersTeams,
        winnersOut,
        0,
        eliminated,
        "seed"
      )
    );
    losersTeams = winnersOut;
  }

  // Пока в winners больше 2 команд: каждый раунд winners порождает два раунда losers:
  // 1) merge (добор проигравших winners), 2) survival (очистка сетки losers).
  for (let winnersRound = 2; winnersRound < winnersRounds; winnersRound += 1) {
    const winnersRoundIn = winnersTeams;
    const winnersOut = winnersRoundIn / 2;
    const dropsToLosers = winnersRoundIn / 2;

    stages.push(
      createStage(
        stageNumber++,
        `Этап ${stageNumber - 1} — Виннеры`,
        "winners",
        winnersRound,
        winnersRoundIn,
        winnersOut,
        dropsToLosers,
        0
      )
    );
    winnersTeams = winnersOut;

    // Merge round in losers
    {
      const losersMergeIn = losersTeams + dropsToLosers;
      const losersMergeOut = losersMergeIn / 2;
      const eliminated = losersMergeIn / 2;

      stages.push(
        createStage(
          stageNumber++,
          `Этап ${stageNumber - 1} — Лузеры (добор)`,
          "losers",
          winnersRound * 2 - 2,
          losersMergeIn,
          losersMergeOut,
          0,
          eliminated,
          "merge"
        )
      );
      losersTeams = losersMergeOut;
    }

    // Survival round in losers
    {
      const losersSurvivalIn = losersTeams;
      const losersSurvivalOut = losersSurvivalIn / 2;
      const eliminated = losersSurvivalIn / 2;

      stages.push(
        createStage(
          stageNumber++,
          `Этап ${stageNumber - 1} — Лузеры (отбор)`,
          "losers",
          winnersRound * 2 - 1,
          losersSurvivalIn,
          losersSurvivalOut,
          0,
          eliminated,
          "survival"
        )
      );
      losersTeams = losersSurvivalOut;
    }
  }

  // Winners final (2 -> 1 + 1 drop to losers final)
  {
    const winnersOut = winnersTeams / 2; // 1
    const dropsToLosers = winnersTeams / 2; // 1
    stages.push(
      createStage(
        stageNumber++,
        "Финал виннеров",
        "winners",
        winnersRounds,
        winnersTeams,
        winnersOut,
        dropsToLosers,
        0
      )
    );
    winnersTeams = winnersOut;

    const losersFinalIn = losersTeams + dropsToLosers;
    const losersFinalOut = losersFinalIn / 2; // 1
    const eliminated = losersFinalIn / 2;

    stages.push(
      createStage(
        stageNumber++,
        "Финал лузеров",
        "losers",
        winnersRounds * 2 - 1,
        losersFinalIn,
        losersFinalOut,
        0,
        eliminated,
        "final"
      )
    );
    losersTeams = losersFinalOut;
  }

  // Grand final: 1 winner bracket champion vs 1 loser bracket champion
  stages.push(
    createStage(
      stageNumber++,
      "Гранд-финал",
      "final",
      1,
      winnersTeams + losersTeams,
      1,
      0,
      1
    )
  );

  return {
    teamCount,
    winnersChampionCount: winnersTeams,
    losersChampionCount: losersTeams,
    grandFinalists: winnersTeams + losersTeams,
    championCount: 1,
    totalStages: stages.length,
    totalMatches: stages.reduce((sum, stage) => sum + stage.matches, 0),
    stages,
  };
}
