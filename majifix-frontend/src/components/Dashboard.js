import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchWaterPoints();
    fetchStats();
  }, []);

  const fetchWaterPoints = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/water-points', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setWaterPoints(response.data);
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(response.data);
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.waterPoints || 0}</h3>
              <p>Total Water Points</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{stats.working || 0}</h3>
              <p>Working Systems</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{stats.broken || 0}</h3>
              <p>Broken Systems</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{stats.faults || 0}</h3>
              <p>Open Faults</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mb-3">Water Points</h3>
      <Button as={Link} to="/report-fault" variant="primary" className="mb-3">+ Report Fault</Button>
      
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
    </Container>
  );
};

export default Dashboard;