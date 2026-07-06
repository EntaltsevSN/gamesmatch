import React from "react";
import { Badge, Card, Stack, Table, Title } from "@mantine/core";
import { PlatformSlug } from "../config/matchPlatforms";

export type GlobalRatingRow = {
  id: number;
  title: string;
  platformSlug: PlatformSlug;
  platformName: string;
  championCount: number;
  matchesPlayed: number;
  globalRating: number;
};

type GlobalRatingTableProps = {
  rows: GlobalRatingRow[];
};

const cardStyle = {
  background: "rgba(21, 29, 53, 0.45)",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
} as const;

function GlobalRatingTable({ rows }: GlobalRatingTableProps) {
  return (
    <Card radius="md" padding="md" style={cardStyle}>
      <Stack gap="sm">
        <Title order={3} c="white">
          Глобальный рейтинг игр
        </Title>
        <Table
          horizontalSpacing="md"
          verticalSpacing="sm"
          striped
          stripedColor="rgba(255, 255, 255, 0.04)"
          highlightOnHover
          highlightOnHoverColor="rgba(255, 255, 255, 0.06)"
          withRowBorders={false}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th c="white" w={48}>
                #
              </Table.Th>
              <Table.Th c="white">Игра</Table.Th>
              <Table.Th c="white" w={160}>
                Платформа
              </Table.Th>
              <Table.Th c="white" ta="right" w={140}>
                Стал чемпионом
              </Table.Th>
              <Table.Th c="white" ta="right" w={140}>
                Сыграно матчей
              </Table.Th>
              <Table.Th c="white" ta="right" w={140}>
                Глобальный рейтинг
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, index) => (
              <Table.Tr key={`${row.platformSlug}-${row.id}`}>
                <Table.Td c="white">{index + 1}</Table.Td>
                <Table.Td c="white">{row.title}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray">
                    {row.platformName}
                  </Badge>
                </Table.Td>
                <Table.Td c="white" ta="right">
                  {row.championCount}
                </Table.Td>
                <Table.Td c="white" ta="right">
                  {row.matchesPlayed}
                </Table.Td>
                <Table.Td c="white" ta="right">
                  {row.globalRating}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}

export default GlobalRatingTable;
