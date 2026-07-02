import React from "react";

type GameCardProps = {
  gameId: number;
  games: Array<{ id: number; title: string; image: string }>;
  assetFolder: string;
  onPick?: () => void;
};

function GameCard({ gameId, games, assetFolder, onPick }: GameCardProps) {
  const game = games.find((item) => item.id === gameId);

  if (!game) {
    return (
      <article className="contestant">
        <h3>Игра не найдена</h3>
        <p>id: {gameId}</p>
      </article>
    );
  }

  const imageSrc = new URL(`../assets/${assetFolder}/${game.image}`, import.meta.url).href;
  const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='420'><rect width='100%' height='100%' fill='#0d1628'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ecf0ff' font-family='Arial, sans-serif' font-size='18'>${game.title}</text></svg>`;
  const fallbackSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;

  return (
    <article className="contestant">
      <h3>{game.title}</h3>
      <div className="cover-wrap">
        <button
          className="cover-pick-btn"
          type="button"
          onClick={onPick}
          disabled={!onPick}
          aria-label={`Выбрать ${game.title}`}
        >
          <img
            key={game.id}
            className="cover"
            src={imageSrc}
            alt={game.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackSrc;
            }}
          />
        </button>
      </div>
    </article>
  );
}

export default GameCard;
