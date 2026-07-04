import React from "react";
import { Card, Stack, Text, Title } from "@mantine/core";
import type { StagePlan } from "../config/matchSystem";

type StageProps = {
  stage: StagePlan;
  stageIndex: number;
  totalStages: number;
  currentPair: number;
  totalPairs: number;
  gamesLeft: number;
};

function getGridTypeLabel(stage: StagePlan): string {
  if (stage.bracket === "winners") return "Виннеров";
  if (stage.bracket === "losers") return "Лузеров";
  return "Финальная";
}

function Stage({ stage, stageIndex, totalStages, currentPair, totalPairs, gamesLeft }: StageProps) {
  const title = `Этап ${stageIndex + 1} из ${totalStages}`;
  const metrics = `Сетка ${getGridTypeLabel(stage)} • ${currentPair} из ${totalPairs} пар • Осталось игр: ${gamesLeft}`;

  return (
    <Card
      radius="md"
      padding="md"
      style={{
        background: "rgba(21, 29, 53, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
      }}
    >
      <Stack gap="xs">
        <Title order={3} c="white">
          {title}
        </Title>
        <Text c="white" size="sm">
          {metrics}
        </Text>
      </Stack>
    </Card>
  );
}

export default Stage;
