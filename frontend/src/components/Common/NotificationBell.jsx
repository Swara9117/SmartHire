import React, { useEffect, useState, useRef } from 'react';
import { getNotifications, markNotificationAsRead } from '../../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await getNotifications(token);
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    // Fetch notifications immediately
    fetchNotifications();

    // Set up periodic polling every 30 seconds as fallback
    const interval = setInterval(fetchNotifications, 30000);

    // Set up WebSocket for real-time notifications
    const token = localStorage.getItem('token');
    if (token) {
      const ws = new WebSocket(`ws://localhost:5000`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            // Add new notification to the list
            setNotifications(prev => [data.data, ...prev]);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;
    }

    // Cleanup interval and WebSocket on component unmount
    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await markNotificationAsRead(id, token);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setShowDropdown((s) => !s)}>
        🔔
        {unreadCount > 0 && <span style={{
          color: 'white', background: 'red', borderRadius: '50%', padding: '2px 6px', marginLeft: 4
        }}>{unreadCount}</span>}
      </button>
      {showDropdown && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #ccc', zIndex: 10, minWidth: 200
        }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 10 }}>No notifications</div>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} style={{
                padding: 10, background: notif.read ? '#f0f0f0' : '#e6f7ff', cursor: 'pointer'
              }}
                onClick={() => handleMarkAsRead(notif._id)}
              >
                {notif.message}
                {!notif.read && <span style={{ color: 'blue', marginLeft: 8 }}>(new)</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
