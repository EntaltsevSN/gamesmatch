import React, { useMemo } from "react";
import { Badge, Card, Container, Image, Select, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import { PlatformSlug, matchPlatforms } from "../../config/matchPlatforms";

type RatingGame = {
  id: number;
  title: string;
  image: string;
  platformSlug: PlatformSlug;
  platformName: string;
  assetFolder: string;
};

const platformSlugSet = new Set<PlatformSlug>(matchPlatforms.map((platform) => platform.slug));

function isPlatformSlug(value: string | null): value is PlatformSlug {
  return value !== null && platformSlugSet.has(value as PlatformSlug);
}

function Rating() {
  const [searchParams, setSearchParams] = useSearchParams();
  const platformFromUrl = searchParams.get("platform");
  const selectedPlatform: PlatformSlug | "all" = isPlatformSlug(platformFromUrl) ? platformFromUrl : "all";

  const allGames = useMemo<RatingGame[]>(
    () =>
      matchPlatforms
        .flatMap((platform) =>
          platform.games.map((game) => ({
            ...game,
            platformSlug: platform.slug,
            platformName: platform.name,
            assetFolder: platform.assetFolder,
          }))
        )
        .sort((a, b) => a.title.localeCompare(b.title)),
    []
  );

  const filteredGames = useMemo(
    () => (selectedPlatform === "all" ? allGames : allGames.filter((game) => game.platformSlug === selectedPlatform)),
    [allGames, selectedPlatform]
  );

  const handlePlatformChange = (platform: PlatformSlug | "all") => {
    if (platform === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ platform });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Header
          title="Общий рейтинг игр"
          subtitle="Все игры из всех платформ. Используй фильтр, чтобы оставить только нужную платформу."
        />

        <Card withBorder radius="md" padding="md">
          <Select
            label="Платформа"
            value={selectedPlatform}
            onChange={(value) => handlePlatformChange((value as PlatformSlug | "all") ?? "all")}
            data={[
              { value: "all", label: "Все платформы" },
              ...matchPlatforms.map((platform) => ({ value: platform.slug, label: platform.name })),
            ]}
            allowDeselect={false}
          />
        </Card>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredGames.map((game) => {
            const imageSrc = new URL(`../../assets/${game.assetFolder}/${game.image}`, import.meta.url).href;
            const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='#0d1628'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ecf0ff' font-family='Arial, sans-serif' font-size='16'>${game.title}</text></svg>`;
            const fallbackSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;

            return (
              <Card key={`${game.platformSlug}-${game.id}`} withBorder radius="md" padding="sm">
                <Card.Section>
                  <Image
                    src={imageSrc}
                    alt={game.title}
                    h={180}
                    fit="contain"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackSrc;
                    }}
                  />
                </Card.Section>
                <Stack gap={6} mt="sm">
                  <Title order={4}>{game.title}</Title>
                  <Badge variant="light">{game.platformName}</Badge>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
        <Text c="dimmed">Показано игр: {filteredGames.length}</Text>
      </Stack>
    </Container>
  );
}

export default Rating;
