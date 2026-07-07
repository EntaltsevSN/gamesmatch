import React, { useEffect, useState } from "react";
import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const modalStyles = {
  content: {
    background: "rgba(21, 29, 53, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
  },
  header: {
    background: "transparent",
  },
  title: {
    color: "#ecf0ff",
    fontWeight: 700,
  },
  close: {
    color: "#aab5da",
  },
} as const;

const inputStyles = {
  label: {
    color: "#ecf0ff",
    fontWeight: 500,
  },
  input: {
    backgroundColor: "rgba(13, 22, 40, 0.85)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    color: "#ecf0ff",
  },
} as const;

const primaryButtonStyle = {
  background: "#3f8cff",
  border: "none",
} as const;
type WinnerProps = {
  isOpen: boolean;
  championTitle: string;
  matchId: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
};

function Winner({ isOpen, championTitle, matchId, onClose, onSave }: WinnerProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setFeedback("");
      setIsSaving(false);
      setIsSaved(false);
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
      setIsSaved(true);
    } catch {
      setFeedback("Не удалось сохранить результат. Попробуй ещё раз.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryAction = () => {
    if (isSaved) {
      onClose();
      navigate(`/matches/${matchId}`);
      return;
    }

    void handleSave();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Матч завершен"
      centered
      radius="md"
      overlayProps={{ blur: 6, opacity: 0.45 }}
      styles={modalStyles}
    >
      <Stack gap="md">
        <Text c="#aab5da" size="sm">
          Чемпион: <Text span c="#ecf0ff" fw={600}>{championTitle}</Text>
        </Text>
        <TextInput
          id="winner-run-name"
          label="Введи своё имя, чтобы сохранить результат"
          maxLength={64}
          placeholder="Твоё имя..."
          autoComplete="off"
          value={name}
          disabled={isSaved}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !isSaved) {
              void handleSave();
            }
          }}
          styles={inputStyles}
        />
        {feedback ? (
          <Text c={feedback.includes("Не удалось") ? "#ff8787" : "#7ef5a0"} size="sm">
            {feedback}
          </Text>
        ) : null}
        <Button
          onClick={handlePrimaryAction}
          loading={isSaving}
          disabled={isSaving}
          w="fit-content"
          radius="md"
          style={primaryButtonStyle}
        >
          {isSaved ? "Смотреть результаты" : "Сохранить"}
        </Button>
      </Stack>
    </Modal>
  );}

export default Winner;
