import React, { useEffect, useMemo, useState } from "react";
import { Card, Center, Container, Loader, Select, Stack, Text } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { getMatches, StoredMatch } from "../../api/matches";
import GlobalRatingTable, { GlobalRatingRow } from "../../components/GlobalRatingTable";
import Header from "../../components/Header";
import { PlatformSlug, matchPlatforms } from "../../config/matchPlatforms";
import { aggregateMatchMetrics, compareRatingRows, getMetricsForGame } from "../../utils/globalRating";

const platformSlugSet = new Set<PlatformSlug>(matchPlatforms.map((platform) => platform.slug));

const glassCardStyle = {
  background: "rgba(21, 29, 53, 0.45)",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
} as const;

const platformSelectStyles = {
  label: {
    color: "#ecf0ff",
    fontWeight: 500,
  },
  input: {
    backgroundColor: "rgba(21, 29, 53, 0.45)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    color: "#ecf0ff",
  },
  section: {
    color: "#aab5da",
  },
  dropdown: {
    backgroundColor: "rgba(21, 29, 53, 0.95)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
  },
  option: {
    color: "#ecf0ff",
  },
} as const;

function isPlatformSlug(value: string | null): value is PlatformSlug {
  return value !== null && platformSlugSet.has(value as PlatformSlug);
}

function Rating() {
  const [searchParams, setSearchParams] = useSearchParams();
  const platformFromUrl = searchParams.get("platform");
  const selectedPlatform: PlatformSlug | "all" = isPlatformSlug(platformFromUrl) ? platformFromUrl : "all";
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMatches = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getMatches();
        if (isActive) {
          setMatches(data);
        }
      } catch {
        if (isActive) {
          setLoadError("Не удалось загрузить матчи.");
          setMatches([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      isActive = false;
    };
  }, []);

  const allRows = useMemo<GlobalRatingRow[]>(() => {
    const metrics = aggregateMatchMetrics(matches);

    return matchPlatforms
      .flatMap((platform) =>
        platform.games.map((game) => {
          const gameMetrics = getMetricsForGame(metrics, platform.slug, game.id);

          return {
            id: game.id,
            title: game.title,
            platformSlug: platform.slug,
            platformName: platform.name,
            championCount: gameMetrics.championCount,
            matchesPlayed: gameMetrics.matchesPlayed,
            globalRating: gameMetrics.globalRating,
          };
        })
      )
      .sort(compareRatingRows);
  }, [matches]);

  const filteredRows = useMemo(
    () => (selectedPlatform === "all" ? allRows : allRows.filter((row) => row.platformSlug === selectedPlatform)),
    [allRows, selectedPlatform]
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

        <Card withBorder radius="md" padding="md" style={glassCardStyle}>
          <Select
            label="Платформа"
            value={selectedPlatform}
            onChange={(value) => handlePlatformChange((value as PlatformSlug | "all") ?? "all")}
            data={[
              { value: "all", label: "Все платформы" },
              ...matchPlatforms.map((platform) => ({ value: platform.slug, label: platform.name })),
            ]}
            allowDeselect={false}
            disabled={isLoading}
            styles={platformSelectStyles}
            comboboxProps={{ withinPortal: true }}
          />
        </Card>

        {isLoading ? (
          <Card radius="md" padding="xl" style={glassCardStyle}>
            <Center>
              <Loader color="blue" type="dots" />
            </Center>
          </Card>
        ) : (
          <GlobalRatingTable rows={filteredRows} />
        )}

        {loadError ? <Text c="red">{loadError}</Text> : null}
        {!isLoading ? <Text c="dimmed">Показано игр: {filteredRows.length}</Text> : null}
      </Stack>
    </Container>
  );
}

export default Rating;
