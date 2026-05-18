import React, { useEffect, useState } from 'react';
import { Container, ListGroup, Badge, Button } from 'react-bootstrap';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://majifix.onrender.com/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(response.data);
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`https://majifix.onrender.com/api/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
  };

  return (
    <Container className="mt-5">
      <h2>Notifications</h2>
      <ListGroup>
        {notifications.map(notification => (
          <ListGroup.Item key={notification.id} className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{notification.type}</strong>: {notification.message}
              {!notification.is_read && <Badge bg="primary" className="ms-2">New</Badge>}
            </div>
            {!notification.is_read && (
              <Button size="sm" onClick={() => markAsRead(notification.id)}>Mark Read</Button>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default Notifications;