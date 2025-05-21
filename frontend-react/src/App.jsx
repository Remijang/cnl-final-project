import React, { useEffect, useState } from "react";
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

const CalendarDetailPageWrapper = () => {
  const { calendarId } = useParams();
  const token = localStorage.getItem("token");

  return <CalendarDetailPage calendarId={calendarId} token={token} />;
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth" element={<OAuthRedirect setToken={setToken} />} />
        <Route
          path="/calendar/:calendarId"
          element={<CalendarDetailPageWrapper />}
        />
        <Route path="/group" element={<GroupsPageWrapper />} />
        <Route path="/poll" element={<PollPageWrapper />} />
      </Routes>
    </Router>
  );
};

export default App;
