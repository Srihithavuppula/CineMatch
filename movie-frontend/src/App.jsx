import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home   from "./pages/Home";
import Login  from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RecommendationPage from "./pages/RecommendationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Navbar onSearch={setSearchQuery} />
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            <ProtectedRoute>
              <RecommendationPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <footer className="footer">
        <span className="footer__logo">
          <span>Cine</span><span>Match</span>
        </span>
        <p>&copy; 2026 CineMatch. Discover your next favorite film.</p>
      </footer>
    </>
  );
}