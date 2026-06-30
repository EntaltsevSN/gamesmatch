type HistoryProps = {
  items: string[];
};

function History({ items }: HistoryProps) {
  return (
    <section className="log-card">
      <h2>Ход турнира</h2>
      <ul id="stage-log">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default History;
