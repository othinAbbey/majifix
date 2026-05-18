import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [stats, setStats] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const [assignmentStatus, setAssignmentStatus] = useState({ pending: 0, in_progress: 0, completed: 0 });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentWaterPoints, setRecentWaterPoints] = useState([]);
  const [ussdRegistrationCount, setUssdRegistrationCount] = useState(0);

  useEffect(() => {
    fetchWaterPoints();
    fetchStats();
    fetchNotifications();
    fetchAssignmentStatus();
  }, []);

  const fetchWaterPoints = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://majifix.onrender.com/api/water-points', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const points = response.data;
    setWaterPoints(points);
    setRecentWaterPoints(points.slice(-5).reverse());
    setUssdRegistrationCount(points.filter((point) => point.created_via_ussd).length);
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://majifix.onrender.com/api/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(response.data);
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://majifix.onrender.com/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const unread = response.data.filter((notification) => !notification.is_read).length;
    setNotificationCount(unread);
    setRecentNotifications(response.data.slice(0, 5));
  };

  const fetchAssignmentStatus = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://majifix.onrender.com/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const counts = response.data.reduce(
      (acc, assignment) => {
        const status = assignment.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { pending: 0, in_progress: 0, completed: 0 }
    );
    setAssignmentStatus(counts);
    setRecentAssignments(response.data.slice(0, 5));
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.waterPoints || 0}</h3>
              <p>Total Water Points</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{stats.working || 0}</h3>
              <p>Working Systems</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{stats.broken || 0}</h3>
              <p>Broken Systems</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{stats.assignments || 0}</h3>
              <p>Assignments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{notificationCount}</h3>
              <p>Unread Notifications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-secondary">{ussdRegistrationCount}</h3>
              <p>USSD Water Points</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-secondary">{assignmentStatus.pending || 0}</h3>
              <p>Pending Assignments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mt-3 mt-md-0">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{assignmentStatus.in_progress || 0}</h3>
              <p>In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mt-3 mt-md-0">
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{assignmentStatus.completed || 0}</h3>
              <p>Completed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mb-3">Water Points</h3>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button as={Link} to="/report-fault" variant="primary">+ Report Fault</Button>
        <Button as={Link} to="/add-water-point" variant="success">+ Add Water Point</Button>
      </div>
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>District</th>
            <th>Village</th>
            <th>Status</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {waterPoints.map(point => (
            <tr key={point.id}>
              <td>{point.name}</td>
              <td>{point.district}</td>
              <td>{point.village}</td>
              <td>
                <span className={`badge bg-${point.status === 'working' ? 'success' : 'danger'}`}>
                  {point.status}
                </span>
              </td>
              <td>{point.water_source_type}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <h4>Recent Notifications</h4>
              {recentNotifications.length === 0 ? (
                <p className="text-muted">No notifications yet.</p>
              ) : (
                <ul className="list-unstyled">
                  {recentNotifications.map((notification) => (
                    <li key={notification.id} className="mb-2">
                      <strong>{notification.type}</strong>: {notification.message}
                      {!notification.is_read && <Badge bg="primary" className="ms-2">New</Badge>}
                    </li>
                  ))}
                </ul>
              )}
              <Button as={Link} to="/notifications" size="sm" variant="outline-primary">
                View all notifications
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <h4>Recent Assignments</h4>
              {recentAssignments.length === 0 ? (
                <p className="text-muted">No assignments yet.</p>
              ) : (
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Fault</th>
                      <th>Technician</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>{assignment.issue_type}</td>
                        <td>{assignment.technician_name}</td>
                        <td>{assignment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              <Button as={Link} to="/assignments" size="sm" variant="outline-primary">
                View all assignments
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <h4>Recent Water Points</h4>
              {recentWaterPoints.length === 0 ? (
                <p className="text-muted">No water points created yet.</p>
              ) : (
                <ul className="list-unstyled">
                  {recentWaterPoints.map((point) => (
                    <li key={point.id} className="mb-2">
                      <strong>{point.name}</strong> - {point.district}, {point.parish}, {point.village}
                      <br />
                      <small>
                        {point.water_source_type || 'unknown source'} • {point.status}
                        {point.created_via_ussd && (
                          <Badge bg="info" className="ms-2">USSD</Badge>
                        )}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
              <Button as={Link} to="/dashboard" size="sm" variant="outline-primary">
                View water points
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;