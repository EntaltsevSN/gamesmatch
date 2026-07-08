import React, { useEffect, useMemo, useState } from "react";
import { Anchor, Card, Center, Container, List, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { getMatches, StoredMatch } from "../../api/matches";
import Header from "../../components/Header";
import { PlatformSlug, matchPlatforms, matchPlatformsBySlug } from "../../config/matchPlatforms";
import { aggregateMatchMetrics, compareRatingRows, getMetricsForGame } from "../../utils/globalRating";

const HOME_BLOCK_LIMIT = 10;

function formatCountWord(value: number, one: string, few: string, many: string): string {
  const abs = Math.abs(value);
  const lastTwo = abs % 100;
  const last = abs % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return many;
  }
  if (last === 1) {
    return one;
  }
  if (last >= 2 && last <= 4) {
    return few;
  }
  return many;
}

function formatGamesWord(value: number): string {
  return formatCountWord(value, "игра", "игры", "игр");
}

function formatMatchesWord(value: number): string {
  return formatCountWord(value, "матч", "матча", "матчей");
}

function formatPointsWord(value: number): string {
  return formatCountWord(value, "очко", "очка", "очков");
}

function buildPopularPlatforms(matches: StoredMatch[]) {
  const counts = new Map<string, number>();

  for (const match of matches) {
    counts.set(match.platform, (counts.get(match.platform) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      name: matchPlatformsBySlug[slug as PlatformSlug]?.name ?? slug,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, HOME_BLOCK_LIMIT);
}

function buildPopularGames(matches: StoredMatch[]) {
  const metrics = aggregateMatchMetrics(matches);

  return matchPlatforms
    .flatMap((platform) =>
      platform.games.map((game) => {
        const gameMetrics = getMetricsForGame(metrics, platform.slug, game.id);

        return {
          id: game.id,
          title: game.title,
          platformSlug: platform.slug,
          globalRating: gameMetrics.globalRating,
          championCount: gameMetrics.championCount,
          matchesPlayed: gameMetrics.matchesPlayed,
        };
      })
    )
    .filter((game) => game.globalRating > 0)
    .sort(compareRatingRows)
    .slice(0, HOME_BLOCK_LIMIT);
}

function getMatchGamesCount(match: StoredMatch): number {
  return match.runtime?.count ?? match.gamesList.length;
}

function getMatchUrl(match: StoredMatch): string {
  return `/matches/${match.id}`;
}

function Home() {
  const glassCardStyle = {
    background: "rgba(21, 29, 53, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
  } as const;

  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMatches = async () => {
      setIsLoadingMatches(true);
      setMatchesError(null);

      try {
        const data = await getMatches();
        if (isActive) {
          setMatches(data);
        }
      } catch {
        if (isActive) {
          setMatchesError("Не удалось загрузить матчи.");
          setMatches([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingMatches(false);
        }
      }
    };

    loadMatches();

    return () => {
      isActive = false;
    };
  }, []);

  const recentMatches = useMemo(() => matches.slice(0, HOME_BLOCK_LIMIT), [matches]);
  const popularPlatforms = useMemo(() => buildPopularPlatforms(matches), [matches]);
  const popularGames = useMemo(() => buildPopularGames(matches), [matches]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Header title="Главная" subtitle="Выбери раздел и продолжай." showPageHeading={false} />

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Card radius="md" padding="lg" style={glassCardStyle}>
            <Stack gap="sm">
              <Title order={3} c="white">
                Последние матчи
              </Title>
              {isLoadingMatches ? (
                <Center py="sm">
                  <Loader size="sm" color="gray" />
                </Center>
              ) : matchesError ? (
                <Text size="sm" c="dimmed">
                  {matchesError}
                </Text>
              ) : recentMatches.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Пока нет сохранённых матчей.
                </Text>
              ) : (
                <List spacing="xs" listStyleType="none" icon={null} withPadding={false}>
                  {recentMatches.map((match) => {
                    const platformName = matchPlatformsBySlug[match.platform]?.name ?? match.platform;
                    const gamesCount = getMatchGamesCount(match);
                    const author = match.author?.trim();

                    return (
                      <List.Item key={match.id}>
                        <Anchor component={Link} to={getMatchUrl(match)}>
                          {platformName}
                        </Anchor>
                        <Text span c="dimmed">
                          {" "}({gamesCount} {formatGamesWord(gamesCount)})
                          {author ? ` от ${author}` : ""}
                        </Text>
                      </List.Item>
                    );
                  })}
                </List>
              )}
            </Stack>
          </Card>

          <Card radius="md" padding="lg" style={glassCardStyle}>
            <Stack gap="sm">
              <Title order={3} c="white">
                Популярные платформы
              </Title>
              {isLoadingMatches ? (
                <Center py="sm">
                  <Loader size="sm" color="gray" />
                </Center>
              ) : matchesError ? (
                <Text size="sm" c="dimmed">
                  {matchesError}
                </Text>
              ) : popularPlatforms.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Пока нет сыгранных матчей.
                </Text>
              ) : (
                <List spacing="xs" listStyleType="none" icon={null} withPadding={false}>
                  {popularPlatforms.map((platform) => (
                    <List.Item key={platform.slug}>
                      <Text>
                        {platform.name}{" "}
                        <Text span c="dimmed">
                          ({platform.count} {formatMatchesWord(platform.count)})
                        </Text>
                      </Text>
                    </List.Item>
                  ))}
                </List>
              )}
            </Stack>
          </Card>

          <Card radius="md" padding="lg" style={glassCardStyle}>
            <Stack gap="sm">
              <Title order={3} c="white">
                Популярные игры
              </Title>
              {isLoadingMatches ? (
                <Center py="sm">
                  <Loader size="sm" color="gray" />
                </Center>
              ) : matchesError ? (
                <Text size="sm" c="dimmed">
                  {matchesError}
                </Text>
              ) : popularGames.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Пока нет игр с очками.
                </Text>
              ) : (
                <List spacing="xs" listStyleType="none" icon={null} withPadding={false}>
                  {popularGames.map((game) => (
                    <List.Item key={`${game.platformSlug}-${game.id}`}>
                      <Text>
                        {game.title}{" "}
                        <Text span c="dimmed">
                          ({game.globalRating} {formatPointsWord(game.globalRating)})
                        </Text>
                      </Text>
                    </List.Item>
                  ))}
                </List>
              )}
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default Home;
