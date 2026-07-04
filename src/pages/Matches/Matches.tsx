import React from "react";
import { Container, Stack } from "@mantine/core";
import Header from "../../components/Header";
import MatchesList from "../../components/Matches";

function MatchesPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Header title="Матчи" subtitle="Выбери платформу и начни турнир." showPageHeading={false} />
        <MatchesList />
      </Stack>
    </Container>
  );
}

export default MatchesPage;
