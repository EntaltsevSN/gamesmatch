import React from "react";
import { Anchor, Badge, Card, Container, Group, List, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { matchPlatforms } from "../../config/matchPlatforms";

function Home() {
  const glassCardStyle = {
    background: "rgba(21, 29, 53, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
  } as const;

  const recentMatches = [...matchPlatforms]
    .reverse()
    .slice(0, 4)
    .map((platform) => ({ label: platform.name, route: platform.route }));

  const popularPlatforms = [...matchPlatforms]
    .sort((a, b) => b.games.length - a.games.length)
    .slice(0, 4)
    .map((platform) => ({ name: platform.name, gamesCount: platform.games.length }));

  const popularGames = matchPlatforms
    .flatMap((platform) => platform.games.map((game) => ({ ...game, platformName: platform.name })))
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 8);

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
              <Text size="xs" c="dimmed">
                раздел в разработке
              </Text>
              <List spacing="xs">
                {recentMatches.map((match) => (
                  <List.Item key={match.route}>
                    <Anchor component={Link} to={match.route}>
                      {match.label}
                    </Anchor>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Card>

          <Card radius="md" padding="lg" style={glassCardStyle}>
            <Stack gap="sm">
              <Title order={3} c="white">
                Популярные платформы
              </Title>
              <Text size="xs" c="dimmed">
                раздел в разработке
              </Text>
              <List spacing="xs">
                {popularPlatforms.map((platform) => (
                  <List.Item key={platform.name}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text>{platform.name}</Text>
                      <Badge variant="light">{platform.gamesCount} игр</Badge>
                    </Group>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Card>

          <Card radius="md" padding="lg" style={glassCardStyle}>
            <Stack gap="sm">
              <Title order={3} c="white">
                Популярные игры
              </Title>
              <Text size="xs" c="dimmed">
                раздел в разработке
              </Text>
              <List spacing="xs">
                {popularGames.map((game) => (
                  <List.Item key={`${game.platformName}-${game.id}`}>
                    <Text>
                      {game.title} <Text span c="dimmed">({game.platformName})</Text>
                    </Text>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default Home;
