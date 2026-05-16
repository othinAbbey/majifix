import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddWaterPoint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    district: '',
    parish: '',
    village: '',
    water_point_number: '',
    latitude: '',
    longitude: '',
    install_date: '',
    water_source_type: '',
    status: 'working',
    managing_org: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in before creating a water point.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/water-points', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSuccess(`Water point created: ${response.data.name} (ID ${response.data.id})`);
      setForm({
        name: '',
        district: '',
        parish: '',
        village: '',
        water_point_number: '',
        latitude: '',
        longitude: '',
        install_date: '',
        water_source_type: '',
        status: 'working',
        managing_org: '',
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create water point.');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body>
              <h2 className="mb-4">Add Water Point</h2>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Water point name"
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Water Point Number</Form.Label>
                    <Form.Control
                      name="water_point_number"
                      value={form.water_point_number}
                      onChange={handleChange}
                      placeholder="WP-001"
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      placeholder="District"
                      required
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Parish</Form.Label>
                    <Form.Control
                      name="parish"
                      value={form.parish}
                      onChange={handleChange}
                      placeholder="Parish"
                      required
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Village</Form.Label>
                    <Form.Control
                      name="village"
                      value={form.village}
                      onChange={handleChange}
                      placeholder="Village"
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="Latitude"
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                      name="longitude"
                      type="number"
                      step="0.000001"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="Longitude"
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Install Date</Form.Label>
                    <Form.Control
                      name="install_date"
                      type="date"
                      value={form.install_date}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Water Source Type</Form.Label>
                    <Form.Control
                      name="water_source_type"
                      value={form.water_source_type}
                      onChange={handleChange}
                      placeholder="e.g. borehole, tap stand"
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={form.status} onChange={handleChange}>
                      <option value="working">Working</option>
                      <option value="broken">Broken</option>
                      <option value="maintenance">Maintenance</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Managing Organization</Form.Label>
                  <Form.Control
                    name="managing_org"
                    value={form.managing_org}
                    onChange={handleChange}
                    placeholder="Organization"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Create Water Point
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddWaterPoint;
