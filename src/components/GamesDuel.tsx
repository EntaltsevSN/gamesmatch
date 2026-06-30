import React from "react";
import GameCard from "./GameCard";

type GamesDuelProps = {
  leftGameId: number;
  rightGameId: number;
  onPickLeft?: () => void;
  onPickRight?: () => void;
};

function GamesDuel({ leftGameId, rightGameId, onPickLeft, onPickRight }: GamesDuelProps) {
  return (
    <section className="match-section">
      <GameCard gameId={leftGameId} onPick={onPickLeft} />
      <div className="vs">VS</div>
      <GameCard gameId={rightGameId} onPick={onPickRight} />
    </section>
  );
}

export default GamesDuel;
