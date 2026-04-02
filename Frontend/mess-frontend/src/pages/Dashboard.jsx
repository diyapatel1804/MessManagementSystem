import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);

  const [todayAttendance, setTodayAttendance] = useState(0);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [students, payments, complaints, attendance, notificationsRes] = await Promise.all([
        API.get("/Students"),
        API.get("/Payments"),
        API.get("/Complaints"),
        API.get("/MealAttendances"),
        API.get("/notification?role=student") // ✅ Notifications API
      ]);

      setStudentsCount(students.data.length);
      setPaymentsCount(payments.data.length);
      setComplaintsCount(complaints.data.length);
      setAttendanceCount(attendance.data.length);

      // Today's Attendance
      const today = new Date().toISOString().split("T")[0];
      const todayData = attendance.data.filter(
        (a) => a.date && a.date.startsWith(today)
      );
      setTodayAttendance(todayData.length);

      // Recent Complaints
      setRecentComplaints(complaints.data.slice(-5).reverse());

      // Pending Complaints
      const pending = complaints.data.filter(
        (c) => c.status !== "Resolved"
      );
      setPendingComplaints(pending.length);

      // Notifications
      setNotifications(notificationsRes.data.slice(0, 5)); // latest 5
      const unread = notificationsRes.data.filter(n => !n.isRead);
      setUnreadCount(unread.length);

      // Chart Data
      setChartData([
        { name: "Students", value: students.data.length },
        { name: "Payments", value: payments.data.length },
        { name: "Complaints", value: complaints.data.length },
        { name: "Attendance", value: attendance.data.length },
      ]);

      setLoading(false);
    } catch (err) {
      console.log("DASHBOARD ERROR:", err);
      setLoading(false);
    }
  };

  if (loading) return <h3>Loading dashboard...</h3>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* CARDS */}
      <div className="dashboard-grid">

        <div className="card blue">
          <span>👨‍🎓</span>
          <h3>Total Students</h3>
          <p>{studentsCount}</p>
        </div>

        <div className="card green">
          <span>💰</span>
          <h3>Payments</h3>
          <p>{paymentsCount}</p>
        </div>

        <div className="card orange">
          <span>📩</span>
          <h3>Complaints</h3>
          <p>{complaintsCount}</p>
        </div>

        <div className="card purple">
          <span>🍽️</span>
          <h3>Attendance</h3>
          <p>{attendanceCount}</p>
        </div>

        <div className="card dark">
          <span>📅</span>
          <h3>Today's Attendance</h3>
          <p>{todayAttendance}</p>
        </div>

        <div className="card red">
          <span>⚠️</span>
          <h3>Pending Complaints</h3>
          <p>{pendingComplaints}</p>
        </div>

        {/* ✅ NEW NOTIFICATION CARDS */}
        <div className="card yellow">
          <span>🔔</span>
          <h3>Total Notifications</h3>
          <p>{notifications.length}</p>
        </div>

        <div className="card pink">
          <span>🔴</span>
          <h3>Unread Alerts</h3>
          <p>{unreadCount}</p>
        </div>

      </div>

      {/* CHART */}
      <div className="chart-card">
        <h3>Monthly Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT COMPLAINTS */}
      <div className="table-card">
        <h3>Recent Complaints</h3>

        <table>
          <thead>
            <tr>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentComplaints.length > 0 ? (
              recentComplaints.map((c, i) => (
                <tr key={i}>
                  <td>{c.message || "No message"}</td>
                  <td>{c.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No complaints</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ RECENT NOTIFICATIONS */}
      <div className="table-card">
        <h3>Latest Notifications</h3>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <tr key={i}>
                  <td>{n.title}</td>
                  <td>{n.message}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No notifications</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;