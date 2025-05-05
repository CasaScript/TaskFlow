// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import { NotificationProvider } from "./context/NotificationContext";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import DeadlineReminders from "./components/DeadlineReminders";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
        <DeadlineReminders />
      </Router>
    </NotificationProvider>
  );
}

export default App;