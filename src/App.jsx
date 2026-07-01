import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Match from "./pages/Match/Match";
import Home from "./pages/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ps1" element={<Match platform="ps1" />} />
        <Route path="/sega-genesis" element={<Match platform="sega-genesis" />} />
        <Route path="/famicom" element={<Match platform="famicom" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
