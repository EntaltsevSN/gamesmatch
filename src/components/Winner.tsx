import React, { useEffect, useState } from "react";

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
    <div className="winner-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="winner-modal-title">
      <div className="winner-modal">
        <h2 id="winner-modal-title">Турнир завершен</h2>
        <p className="winner-modal-champion">Чемпион: {championTitle}</p>

        <div className="save-run-form">
          <label htmlFor="winner-run-name">Введи своё имя, чтобы сохранить результат:</label>
          <div className="save-run-row">
            <input
              id="winner-run-name"
              type="text"
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
            />
            <button className="save-run-btn" type="button" onClick={handleSave}>
              Сохранить
            </button>
          </div>
          {feedback ? <p className="save-run-feedback">{feedback}</p> : null}
        </div>

        <div className="winner-modal-actions">
          <button className="restart-btn" type="button" onClick={onRestart}>
            Начать заново
          </button>
          <button className="pick-btn" type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export default Winner;
