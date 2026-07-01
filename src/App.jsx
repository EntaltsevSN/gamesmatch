import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Match from "./pages/Match/Match";
import Home from "./pages/Home/Home";
import { matchPlatforms } from "./config/matchPlatforms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {matchPlatforms.map((platform) => (
          <Route key={platform.slug} path={platform.route} element={<Match platform={platform.slug} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
