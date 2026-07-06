import React from "react";
import { Card, Stack, Table, Title } from "@mantine/core";

type MatchLikesRow = {
  id: number;
  title: string;
  likes: number;
};

type MatchLikesTableProps = {
  ranking: MatchLikesRow[];
};

const cardStyle = {
  background: "rgba(21, 29, 53, 0.45)",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
} as const;

function MatchLikesTable({ ranking }: MatchLikesTableProps) {
  return (
    <Card radius="md" padding="md" style={cardStyle}>
      <Stack gap="sm">
        <Title order={3} c="white">
          Рейтинг по выборам
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
              <Table.Th c="white" ta="right" w={96}>
                Выборы
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ranking.map((row, index) => (
              <Table.Tr key={row.id}>
                <Table.Td c="white">{index + 1}</Table.Td>
                <Table.Td c="white">{row.title}</Table.Td>
                <Table.Td c="white" ta="right">
                  {row.likes}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}

export default MatchLikesTable;
