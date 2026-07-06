import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Match from "./pages/Match/Match";
import Home from "./pages/Home/Home";
import MatchesPage from "./pages/Matches/Matches";
import Rating from "./pages/Rating/Rating";
import { matchPlatforms } from "./config/matchPlatforms";

function App() {

  useEffect(() => {
    fetch("/api/matches")
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/rating" element={<Rating />} />
        {matchPlatforms.flatMap((platform) => [
          <Route key={`${platform.slug}-base`} path={platform.route} element={<Match platform={platform.slug} />} />,
          <Route
            key={`${platform.slug}-session`}
            path={`${platform.route}/:matchId`}
            element={<Match platform={platform.slug} />}
          />,
        ])}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
