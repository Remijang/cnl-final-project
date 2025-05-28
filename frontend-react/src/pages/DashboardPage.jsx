import React, { useState } from "react";
import DashboardMain from "../components/DashboardMain";
import DashboardAdmin from "../components/DashboardAdmin";
import DashboardEditor from "../components/DashboardEditor";
import DashboardList from "../components/DashboardList";
import DashboardHeader from "../components/DashboardHeader";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const DashboardRoute = () => {
  return (
    <div>
      <DashboardHeader />
      <Routes>
        <Route path="/" element={<DashboardMain />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/edit" element={<DashboardEditor />} />
        <Route path="/list" element={<DashboardList />} />
      </Routes>
    </div>
  );
};

export default DashboardRoute;
