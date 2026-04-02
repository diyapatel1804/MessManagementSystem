import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import MealMenu from "./pages/MealMenu";
import Payments from "./pages/Payments";
import Complaints from "./pages/Complaints";
import Attendance from "./pages/Attendance";
import Inventory from "./pages/Inventory";
import Notifications from "./pages/Notifications"; // ✅ keep this
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔹 LOGIN ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* 🔹 MAIN LAYOUT ROUTES */}
        <Route path="/" element={<Layout />}>

          {/* Default page */}
          <Route index element={<Dashboard />} />

          {/* All modules */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="mealmenu" element={<MealMenu />} />
          <Route path="payments" element={<Payments />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="inventory" element={<Inventory />} />

          {/* ✅ NEW NOTIFICATIONS MODULE */}
          <Route path="notifications" element={<Notifications  />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;