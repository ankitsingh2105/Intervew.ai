import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import GiveInterview from "./pages/GiveInterview";
import Interview from "./pages/Interview";
import Footer from "./Components/Footer";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/start-interview" element={<GiveInterview />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
