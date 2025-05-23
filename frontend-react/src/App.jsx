import React, { useEffect, useState } from "react";
import Header from "./components/Header";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import OAuthRedirect from "./components/OAuthRedirect";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CalendarDetailPage from "./pages/CalendarDetailPage";
import GroupsPage from "./pages/GroupsPage";
import PollsPage from "./pages/PollsPage";
import CalendarSearchPage from "./pages/CalendarSearchPage";

const CalendarDetailPageWrapper = () => {
  const { calendar_id } = useParams();
  const token = localStorage.getItem("token");

  return <CalendarDetailPage calendar_id={calendar_id} token={token} />;
};

const GroupsPageWrapper = () => {
  const token = localStorage.getItem("token");

  return <GroupsPage token={token} />;
};

const PollPageWrapper = () => {
  const token = localStorage.getItem("token");

  return <PollsPage token={token} />;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    //setToken("");
    location.reload();
    window.location.href = "/login";
  };

  return (
    <Router>
      <Header token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth" element={<OAuthRedirect setToken={setToken} />} />
        <Route
          path="/calendar/:calendar_id"
          element={<CalendarDetailPageWrapper />}
        />
        <Route path="/groups" element={<GroupsPageWrapper />} />
        <Route path="/polls" element={<PollPageWrapper />} />
        <Route
          path="/calendar-search/:username"
          element={<CalendarSearchPage token={token} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
