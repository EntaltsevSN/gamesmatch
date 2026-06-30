import React from "react";
import { Link } from "react-router-dom";

function Matches() {
  return (
    <section className="menu-card">
      <p>Доступные матчи:</p>
      <Link className="contest-link" to="/ps1">
        Открыть PS1 games match
      </Link>
    </section>
  );
}

export default Matches;
