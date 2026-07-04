import React, { useEffect, useRef, useState } from "react";
import { Card, Center, Image, Stack, Text, Title, UnstyledButton } from "@mantine/core";

type GameCardProps = {
  gameId: number;
  games: Array<{ id: number; title: string; image: string }>;
  assetFolder: string;
  onPick?: () => void;
};

function GameCard({ gameId, games, assetFolder, onPick }: GameCardProps) {
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current !== null) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handlePick = () => {
    if (!onPick || isClickAnimating) return;
    setIsClickAnimating(true);
    clickTimeoutRef.current = window.setTimeout(() => {
      onPick();
      setIsClickAnimating(false);
    }, 120);
  };

  const cardScale = isClickAnimating ? 0.97 : isHovered ? 1.015 : 1;

  const glassCardStyle = {
    background: "rgba(21, 29, 53, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
  } as const;

  const game = games.find((item) => item.id === gameId);

  if (!game) {
    return (
      <Card radius="md" padding="lg" style={glassCardStyle}>
        <Title order={4} ta="center" c="white">
          Игра не найдена
        </Title>
        <Text c="dimmed">id: {gameId}</Text>
      </Card>
    );
  }

  const imageSrc = new URL(`../assets/${assetFolder}/${game.image}`, import.meta.url).href;
  const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='420'><rect width='100%' height='100%' fill='#0d1628'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ecf0ff' font-family='Arial, sans-serif' font-size='18'>${game.title}</text></svg>`;
  const fallbackSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;

  return (
    <Card
      radius="md"
      padding="lg"
      style={{
        ...glassCardStyle,
        transform: `scale(${cardScale})`,
        transition: "transform 140ms ease",
      }}
    >
      <UnstyledButton
        type="button"
        onClick={handlePick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={!onPick}
        aria-label={`Выбрать ${game.title}`}
        style={{
          display: "block",
          width: "100%",
          cursor: onPick ? "pointer" : "default",
        }}
      >
        <Stack gap="sm" align="stretch">
          <Title order={4} ta="center" c="white">
            {game.title}
          </Title>
          <Center
            style={{
              width: "100%",
              borderRadius: 8,
              overflow: "hidden",
              background: "#0d1628",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <Image
              key={game.id}
              src={imageSrc}
              alt={game.title}
              h={300}
              fit="contain"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackSrc;
              }}
            />
          </Center>
        </Stack>
      </UnstyledButton>
    </Card>
  );
}

export default GameCard;
