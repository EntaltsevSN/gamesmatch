import MatchList, { type SavedRun } from "./MatchList";

type FooterProps = {
  championTitle: string;
  onRestart?: () => void;
  runs?: SavedRun[];
};

function Footer({ championTitle, onRestart, runs = [] }: FooterProps) {
  return (
    <section className="result-section">
      <h2>{championTitle}</h2>

      <div className="save-run-form">
        <label htmlFor="run-name-input">Введи своё имя, чтобы сохранить результат:</label>
        <div className="save-run-row">
          <input
            id="run-name-input"
            type="text"
            maxLength={64}
            placeholder="Твоё имя..."
            autoComplete="off"
          />
          <button className="save-run-btn" type="button">
            Сохранить
          </button>
        </div>
        <p className="save-run-feedback">Демо-режим: сохранение будет добавлено позже.</p>
      </div>

      <MatchList runs={runs} />

      <button className="restart-btn" type="button" onClick={onRestart}>
        Начать заново
      </button>
    </section>
  );
}

export default Footer;
