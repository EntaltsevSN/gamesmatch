import React, { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";

type WinnerProps = {
  isOpen: boolean;
  championTitle: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  onRestart: () => void;
};

function Winner({ isOpen, championTitle, onClose, onSave, onRestart }: WinnerProps) {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setFeedback("");
      setIsSaving(false);
    }
  }, [isOpen, championTitle]);

  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setFeedback("Введи имя перед сохранением.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      setFeedback(`Прохождение "${trimmed}" сохранено.`);
    } catch {
      setFeedback("Не удалось сохранить результат. Попробуй ещё раз.");
    } finally {
      setIsSaving(false);
    }
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
            <Button size="xs" onClick={handleSave} loading={isSaving} disabled={isSaving}>
              Сохранить
            </Button>
          }
          rightSectionWidth={90}
        />
        {feedback ? <Text c={feedback.includes("Не удалось") ? "red" : "green"}>{feedback}</Text> : null}
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
