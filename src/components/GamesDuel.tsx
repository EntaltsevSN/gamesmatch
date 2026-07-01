import React from "react";
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
    <section className="match-section">
      <GameCard gameId={leftGameId} games={games} assetFolder={assetFolder} onPick={onPickLeft} />
      <div className="vs">VS</div>
      <GameCard gameId={rightGameId} games={games} assetFolder={assetFolder} onPick={onPickRight} />
    </section>
  );
}

export default GamesDuel;
