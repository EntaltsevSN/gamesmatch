import React from "react";
import { Center, Grid, Text } from "@mantine/core";
import GameCard from "./GameCard";

type GamesDuelProps = {
  leftGameId: number;
  rightGameId: number;
  games: Array<{ id: number; title: string; image: string }>;
  assetFolder: string;
  onPickLeft?: () => void;
  onPickRight?: () => void;
};

function GamesDuel({ leftGameId, rightGameId, games, assetFolder, onPickLeft, onPickRight }: GamesDuelProps) {
  return (
    <Grid align="stretch">
      <Grid.Col span={{ base: 12, md: 5 }}>
        <GameCard gameId={leftGameId} games={games} assetFolder={assetFolder} onPick={onPickLeft} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 2 }}>
        <Center h="100%">
          <Text fw={800} c="white" fz={36}>
            VS
          </Text>
        </Center>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <GameCard gameId={rightGameId} games={games} assetFolder={assetFolder} onPick={onPickRight} />
      </Grid.Col>
    </Grid>
  );
}

export default GamesDuel;
