import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Center, Image, Modal, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { MatchPlatform, matchPlatforms } from "../config/matchPlatforms";

const DIFFICULTY_OPTIONS = [16, 32, 64, 128] as const;

type PlatformCardProps = {
  platform: MatchPlatform;
  onLaunch: (targetUrl: string) => void;
  glassCardStyle: {
    background: string;
    border: string;
    backdropFilter: string;
    WebkitBackdropFilter: string;
    boxShadow: string;
  };
};

type UnfinishedSession = {
  storageKey: string;
  id: string;
  platform: string;
  count: number | null;
  updatedAtMs: number;
};

function getLatestUnfinishedSession(): UnfinishedSession | null {
  if (typeof window === "undefined") return null;

  const sessions: UnfinishedSession[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith("gamesmatch.match.")) continue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        id?: string;
        platform?: string;
        champion?: number | null;
        runtime?: {
          platform?: string;
          count?: number;
          updatedAt?: string;
          tournament?: { championId?: number | null };
        };
      };

      const id = parsed.id;
      const platform = parsed.platform ?? parsed.runtime?.platform;
      const champion = parsed.champion ?? parsed.runtime?.tournament?.championId ?? null;
      if (!id || !platform || champion !== null) continue;

      const updatedAtMs = Date.parse(parsed.runtime?.updatedAt ?? "");
      const count = Number.isFinite(parsed.runtime?.count) ? Number(parsed.runtime?.count) : null;

      sessions.push({
        storageKey: key,
        id,
        platform,
        count,
        updatedAtMs: Number.isFinite(updatedAtMs) ? updatedAtMs : 0,
      });
    } catch {
      // ignore malformed records
    }
  }

  if (sessions.length === 0) return null;
  sessions.sort((left, right) => right.updatedAtMs - left.updatedAtMs);
  return sessions[0];
}

function PlatformCard({ platform, onLaunch, glassCardStyle }: PlatformCardProps) {
  const availableSizes = DIFFICULTY_OPTIONS.filter((size) => size <= platform.games.length);
  const defaultSize = availableSizes.includes(64)
    ? 64
    : availableSizes[availableSizes.length - 1] ?? DIFFICULTY_OPTIONS[0];
  const [selectedSize, setSelectedSize] = React.useState<string>(String(defaultSize));

  return (
    <Card radius="md" padding="lg" style={glassCardStyle}>
      <Stack gap="sm" align="stretch">
        <Title order={3} ta="center">
          {platform.name}
        </Title>

        <Center>
          <Image src={platform.logoPath} alt={`${platform.name} logo`} h={92} w="auto" fit="contain" />
        </Center>

        <Text c="dimmed" size="sm">
          Выбери сложность:
        </Text>
        <SegmentedControl
          value={selectedSize}
          onChange={setSelectedSize}
          data={DIFFICULTY_OPTIONS.map((size) => ({
            label: String(size),
            value: String(size),
            disabled: !availableSizes.includes(size),
          }))}
          styles={{
            root: {
              background: "#152447",
              border: "1px solid rgba(255, 255, 255, 0.16)",
            },
            indicator: {
              background: "#223861",
            },
            label: {
              color: "#ecf0ff",
            },
          }}
          fullWidth
        />

        <Button
          onClick={() => onLaunch(`${platform.route}?size=${selectedSize}`)}
          className="match-launch-btn"
          variant="subtle"
          color="gray"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.16)",
            background: "rgba(255, 255, 255, 0.04)",
          }}
        >
          Запустить матч
        </Button>
      </Stack>
    </Card>
  );
}

function Matches() {
  const navigate = useNavigate();
  const glassCardStyle = {
    background: "rgba(21, 29, 53, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
  } as const;
  const [modalOpened, setModalOpened] = React.useState(false);
  const [pendingLaunchUrl, setPendingLaunchUrl] = React.useState("");
  const [unfinishedSession, setUnfinishedSession] = React.useState<UnfinishedSession | null>(null);

  const unfinishedMatchUrl = React.useMemo(() => {
    if (!unfinishedSession) return "";
    const base = `/mathes/${unfinishedSession.platform}/${unfinishedSession.id}`;
    return unfinishedSession.count ? `${base}?size=${unfinishedSession.count}` : base;
  }, [unfinishedSession]);

  const handleLaunchRequest = (targetUrl: string) => {
    const existingSession = getLatestUnfinishedSession();
    if (!existingSession) {
      navigate(targetUrl);
      return;
    }

    setPendingLaunchUrl(targetUrl);
    setUnfinishedSession(existingSession);
    setModalOpened(true);
  };

  return (
    <>
      <div className="matches-grid">
        {matchPlatforms.map((platform) => (
          <React.Fragment key={platform.slug}>
            <PlatformCard platform={platform} onLaunch={handleLaunchRequest} glassCardStyle={glassCardStyle} />
          </React.Fragment>
        ))}
      </div>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="У вас есть незавершенный матч"
        centered
        overlayProps={{ blur: 6, opacity: 0.45 }}
        styles={{
          content: {
            background: "rgba(21, 29, 53, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          },
          header: {
            background: "transparent",
          },
          title: {
            color: "#ecf0ff",
            fontWeight: 700,
          },
        }}
      >
        <Stack gap="sm">
          <Button
            className="match-launch-btn"
            variant="subtle"
            color="gray"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.16)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
            onClick={() => {
              setModalOpened(false);
              if (unfinishedMatchUrl) {
                navigate(unfinishedMatchUrl);
              }
            }}
          >
            Перейти к матчу
          </Button>
          <Button
            className="match-launch-btn"
            variant="subtle"
            color="gray"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.16)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
            onClick={() => {
              if (unfinishedSession) {
                window.localStorage.removeItem(unfinishedSession.storageKey);
              }
              setModalOpened(false);
              if (pendingLaunchUrl) {
                navigate(pendingLaunchUrl);
              }
            }}
          >
            Начать новый матч
          </Button>
          <Button
            className="match-launch-btn"
            variant="subtle"
            color="gray"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.16)",
              background: "rgba(255, 255, 255, 0.04)",
            }}
            onClick={() => setModalOpened(false)}
          >
            Я передумал
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

export default Matches;
