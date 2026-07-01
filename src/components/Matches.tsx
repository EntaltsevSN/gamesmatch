import React from "react";
import { Link } from "react-router-dom";
import { matchPlatforms } from "../config/matchPlatforms";

function Matches() {
  return (
    <section className="menu-card">
      <p>Доступные матчи:</p>
      {matchPlatforms.map((platform) => (
        <Link key={platform.slug} className="contest-link" to={platform.route}>
          Открыть {platform.title}
        </Link>
      ))}
    </section>
  );
}

export default Matches;
