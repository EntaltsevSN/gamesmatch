import React, { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";

type WinnerProps = {
  isOpen: boolean;
  championTitle: string;
  onClose: () => void;
  onRestart: () => void;
};

function Winner({ isOpen, championTitle, onClose, onRestart }: WinnerProps) {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setFeedback("");
    }
  }, [isOpen, championTitle]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setFeedback("Введи имя перед сохранением.");
      return;
    }
    setFeedback(`Прохождение "${trimmed}" сохранено (демо).`);
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Турнир завершен" centered>
      <Stack gap="md">
        <Text c="dimmed">Чемпион: {championTitle}</Text>
        <TextInput
          id="winner-run-name"
          label="Введи своё имя, чтобы сохранить результат"
          maxLength={64}
          placeholder="Твоё имя..."
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSave();
            }
          }}
          rightSection={
            <Button size="xs" onClick={handleSave}>
              Сохранить
            </Button>
          }
          rightSectionWidth={90}
        />
        {feedback ? <Text c="green">{feedback}</Text> : null}
        <Group justify="space-between">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={onRestart}>Начать заново</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default Winner;
