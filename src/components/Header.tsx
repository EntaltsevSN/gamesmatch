import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Anchor, Button, Card, Group, Image, Stack, Text, Title } from "@mantine/core";

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
      // ignore malformed storage records
    }
  }

  if (sessions.length === 0) return null;
  sessions.sort((left, right) => right.updatedAtMs - left.updatedAtMs);
  return sessions[0];
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  showPageHeading?: boolean;
  headingOrder?: 1 | 2 | 3 | 4 | 5 | 6;
};

function Header({ title, subtitle, showPageHeading = true, headingOrder = 1 }: HeaderProps) {
  const location = useLocation();
  const [unfinishedSession, setUnfinishedSession] = useState<UnfinishedSession | null>(null);
  const logo = new URL("../assets/images/logo.png", import.meta.url).href;
  const links = [
    { to: "/", label: "Главная" },
    { to: "/matches", label: "Матчи" },
    { to: "/rating", label: "Рейтинг" },
  ];
  const glassCardStyle = {
    background: "rgba(21, 29, 53, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
  } as const;

  useEffect(() => {
    setUnfinishedSession(getLatestUnfinishedSession());
  }, [location.pathname, location.search]);

  const unfinishedMatchUrl = useMemo(() => {
    if (!unfinishedSession) return "";
    const base = `/mathes/${unfinishedSession.platform}/${unfinishedSession.id}`;
    return unfinishedSession.count ? `${base}?size=${unfinishedSession.count}` : base;
  }, [unfinishedSession]);

  const shouldShowBanner = useMemo(() => {
    if (!unfinishedSession) return false;
    const currentPath = location.pathname.replace(/\/+$/, "");
    const targetPath = `/mathes/${unfinishedSession.platform}/${unfinishedSession.id}`.replace(/\/+$/, "");
    return currentPath !== targetPath;
  }, [unfinishedSession, location.pathname]);

  return (
    <Stack component="header" gap="md">
      {shouldShowBanner ? (
        <Card radius="md" padding="md" style={glassCardStyle}>
          <Stack gap="sm">
            <Text c="white" fw={600}>
              У вас есть незавершенный матч
            </Text>
            <Group gap="sm">
              <Button component={Link} to={unfinishedMatchUrl} variant="light" color="blue">
                Перейти к матчу
              </Button>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  if (!unfinishedSession) return;
                  window.localStorage.removeItem(unfinishedSession.storageKey);
                  setUnfinishedSession(getLatestUnfinishedSession());
                }}
              >
                Сбросить
              </Button>
            </Group>
          </Stack>
        </Card>
      ) : null}

      <Card
        radius="md"
        padding="md"
        style={glassCardStyle}
      >
        <Group justify="space-between" wrap="nowrap">
          <Anchor component={Link} to="/">
            <Image src={logo} alt="Gamesmatch logo" w={120} fit="contain" />
          </Anchor>
          <Group gap="lg">
            {links.map((link) => (
              <Anchor key={`main-${link.label}`} component={Link} to={link.to} fw={600} c="gray.1">
                {link.label}
              </Anchor>
            ))}
          </Group>
        </Group>
      </Card>

      {showPageHeading ? (
        <>
          <Title order={headingOrder}>{title}</Title>
          {subtitle ? <Text c="dimmed">{subtitle}</Text> : null}
        </>
      ) : null}
    </Stack>
  );
}

export default Header;
