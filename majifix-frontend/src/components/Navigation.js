import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navigation = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchUser();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('https://majifix.onrender.com/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = response.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log('Error fetching notifications');
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to get user info (in a real app, use a dedicated endpoint)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (err) {
        console.log('Invalid token');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Navbar bg="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          🚰 MajiFix
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/report-fault">
              Report Fault
            </Nav.Link>
            <Nav.Link as={Link} to="/add-water-point">
              Add Water Point
            </Nav.Link>
            <Nav.Link as={Link} to="/assignments">
              Assignments
            </Nav.Link>
            <Nav.Link as={Link} to="/repairs">
              Repairs
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics">
              Analytics
            </Nav.Link>
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/technicians">
                Technicians
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/notifications">
              Notifications
              {unreadCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {unreadCount}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link onClick={handleLogout} className="text-danger">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;