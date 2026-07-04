import { Card, List, Text, Title } from "@mantine/core";

type HistoryProps = {
  items: string[];
};

function History({ items }: HistoryProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Title order={2} mb="sm">
        Ход турнира
      </Title>
      <List spacing="xs">
        {items.map((item, index) => (
          <List.Item key={`${index}-${item}`}>
            <Text>{item}</Text>
          </List.Item>
        ))}
      </List>
    </Card>
  );
}

export default History;
