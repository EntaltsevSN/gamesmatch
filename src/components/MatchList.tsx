export type SavedRun = {
  id: string;
  name: string;
  champion: string;
  date: string;
  picksCount: number;
};

type MatchListProps = {
  runs: SavedRun[];
};

function MatchList({ runs }: MatchListProps) {
  if (runs.length === 0) {
    return null;
  }

  return (
    <div className="saved-runs-section">
      <h3>Сохранённые прохождения</h3>
      <ul id="saved-runs-list">
        {runs.map((run) => (
          <li key={run.id}>
            <span className="run-name">{run.name}</span>
            {" — чемпион: "}
            <strong>{run.champion}</strong>
            {" "}
            <span className="run-date">{run.date}</span>
            {" "}
            <span className="run-picks">({run.picksCount} матчей)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MatchList;
