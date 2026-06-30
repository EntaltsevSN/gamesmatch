import React from "react";
import Header from "../../components/Header";
import Matches from "../../components/Matches";

function Home() {
  return (
    <main className="app">
      <Header title="Выбор конкурса" subtitle="Выбери матч и начинай турнир." />
      <Matches />
    </main>
  );
}

export default Home;
