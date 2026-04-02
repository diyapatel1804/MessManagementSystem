import { Outlet, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import "./Layout.css";

function Layout() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const lastNotificationId = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = () => {
    API.get("/notification?role=student")
      .then(res => {
        const data = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        if (data.length > 0) {
          const latest = data[0];

          if (lastNotificationId.current !== null && lastNotificationId.current !== latest.id) {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
          }

          lastNotificationId.current = latest.id;
        }
      })
      .catch(err => console.log(err));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">🍽️ Mess System</h2>

        <div className="sidebar-section">
          <h4 className="section-title">Main</h4>
          <Link to="/" className="nav-link">🏠 Dashboard</Link>
        </div>

        <div className="sidebar-section">
          <h4 className="section-title">Student & Menu</h4>
          <Link to="/students" className="nav-link">👩‍🎓 Students</Link>
          <Link to="/mealmenu" className="nav-link">🍱 Meal Menu</Link>
        </div>

        <div className="sidebar-section">
          <h4 className="section-title">Financial</h4>
          <Link to="/payments" className="nav-link">💰 Payments</Link>
          <Link to="/complaints" className="nav-link">⚠️ Complaints</Link>
        </div>

        <div className="sidebar-section">
          <h4 className="section-title">Operations</h4>
          <Link to="/notifications" className="nav-link">🔔 Notifications</Link>
          <Link to="/inventory" className="nav-link">📦 Inventory</Link>
          <Link to="/attendance" className="nav-link">📋 Attendance</Link>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="bell" onClick={() => navigate("/notifications")}>🔔</div>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;