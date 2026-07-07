import React, { useEffect, useMemo, useState } from "react";
import { Card, Center, Container, Loader, Stack, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import { getMatch, StoredMatch } from "../../api/matches";
import Header from "../../components/Header";
import MatchLikesTable from "../../components/MatchLikesTable";
import { GameItem, matchPlatformsBySlug } from "../../config/matchPlatforms";

function formatGamesWord(value: number): string {
  const abs = Math.abs(value);
  const lastTwo = abs % 100;
  const last = abs % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "игр";
  }
  if (last === 1) {
    return "игра";
  }
  if (last >= 2 && last <= 4) {
    return "игры";
  }
  return "игр";
}

function buildLikesRanking(gamesList: StoredMatch["gamesList"], games: GameItem[]) {
  return [...gamesList]
    .map((entry) => ({
      id: entry.id,
      title: games.find((game) => game.id === entry.id)?.title ?? String(entry.id),
      likes: entry.likes ?? 0,
    }))
    .sort((a, b) => b.likes - a.likes || a.title.localeCompare(b.title, "ru"));
}

function MatchResult() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<StoredMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setLoadError("Матч не найден.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadMatch = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getMatch(matchId);
        if (isActive) {
          setMatch(data);
        }
      } catch (error) {
        if (!isActive) return;

        if (error instanceof Error && error.message === "NOT_FOUND") {
          setLoadError("Матч не найден.");
        } else {
          setLoadError("Не удалось загрузить матч.");
        }
        setMatch(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadMatch();

    return () => {
      isActive = false;
    };
  }, [matchId]);

  const platform = match ? matchPlatformsBySlug[match.platform] : null;

  const ranking = useMemo(() => {
    if (!match || !platform) return [];
    return buildLikesRanking(match.gamesList, platform.games);
  }, [match, platform]);

  const subtitle = useMemo(() => {
    if (!match || !platform) return undefined;

    const gamesCount = match.runtime?.count ?? match.gamesList.length;
    const championTitle =
      match.champion != null
        ? platform.games.find((game) => game.id === match.champion)?.title ?? String(match.champion)
        : null;

    const parts = [`${platform.name} • ${gamesCount} ${formatGamesWord(gamesCount)}`];
    if (championTitle) {
      parts.push(`Чемпион: ${championTitle}`);
    }

    return parts.join(" • ");
  }, [match, platform]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Header
          title={match?.author?.trim() || "Без автора"}
          subtitle={subtitle}
          subtitleColor="white"
        />

        {isLoading ? (
          <Card radius="md" padding="xl">
            <Center>
              <Loader color="blue" type="dots" />
            </Center>
          </Card>
        ) : loadError ? (
          <Text c="red">{loadError}</Text>
        ) : ranking.length > 0 ? (
          <MatchLikesTable ranking={ranking} />
        ) : (
          <Text c="dimmed">Для этого матча пока нет результатов.</Text>
        )}
      </Stack>
    </Container>
  );
}

export default MatchResult;
