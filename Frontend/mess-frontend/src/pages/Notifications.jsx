import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import "./Notifications.css";
import toast, { Toaster } from "react-hot-toast";

function Notifications({ userRole }) {
  const [notifications, setNotifications] = useState([]);

  const lastId = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = () => {
    API.get(`/notification`)
      .then((res) => {
        // ✅ SAFE DATA HANDLE (IMPORTANT FIX)
        const data = (res.data || []).map((n) => ({
          id: n.id,
          title: n.title || n.Title || "No Title",
          message:
            n.message ||
            n.Message ||
            n.msg ||
            n.description ||
            "No message",
          type: n.type || n.Type,
          isRead: n.isRead ?? n.IsRead ?? false,
          createdAt: n.createdAt || n.CreatedAt,
          targetRole: n.targetRole || n.TargetRole,
        }));

        // ✅ FILTER ROLE (ADMIN = ALL)
        const filtered = data.filter(
          (n) =>
            userRole === "Admin" ||
            n.targetRole === userRole ||
            !n.targetRole
        );

        // ✅ SORT
        const sorted = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotifications(sorted);

        // 🔔 SOUND + TOAST
        if (sorted.length > 0) {
          const latest = sorted[0];

          if (lastId.current !== null && lastId.current !== latest.id) {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
            toast.success(latest.title);
          }

          lastId.current = latest.id;
        }
      })
      .catch((err) => console.log(err));
  };

  const markAsRead = (id) => {
    API.patch(`/notification/${id}/read`).then(() => {
      toast("Marked as read ✅");
      fetchNotifications();
    });
  };

  const deleteNotification = (id) => {
    API.delete(`/notification/${id}`).then(() => {
      toast.error("Deleted ❌");
      fetchNotifications();
    });
  };

  return (
    <div className="notifications-container">
      <Toaster position="top-right" />

      <h2>🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications yet 😴</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card ${!n.isRead ? "unread" : ""}`}
          >
            <div className="notification-header">
              <h4>{n.title}</h4>
              <span className="type">{n.type}</span>
            </div>

            {/* ✅ MESSAGE WILL 100% SHOW */}
            <p>{JSON.stringify(n)}</p>
            <div className="actions">
              {/* ✅ ADMIN ONLY */}
              {userRole === "Admin" && (
                <>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n.id)}>
                      Mark as Read
                    </button>
                  )}

                  <button onClick={() => deleteNotification(n.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;