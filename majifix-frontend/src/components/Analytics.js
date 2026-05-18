import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

const Analytics = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://majifix.onrender.com/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    };
    fetchData();
  }, []);

  return (
    <Container className="mt-5">
      <h2>Analytics Dashboard</h2>
      <Row>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.waterPoints || 0}</Card.Title>
              <Card.Text>Total Water Points</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.working || 0}</Card.Title>
              <Card.Text>Working Systems</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.broken || 0}</Card.Title>
              <Card.Text>Broken Systems</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.faults || 0}</Card.Title>
              <Card.Text>Total Fault Reports</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.assignments || 0}</Card.Title>
              <Card.Text>Total Assignments</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.pending || 0}</Card.Title>
              <Card.Text>Pending Assignments</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.completed || 0}</Card.Title>
              <Card.Text>Completed Repairs</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>{data.in_progress || 0}</Card.Title>
              <Card.Text>In Progress</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;