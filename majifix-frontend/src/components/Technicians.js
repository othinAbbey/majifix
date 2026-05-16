import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [formTech, setFormTech] = useState({
    username: '',
    contact_number: '',
    password: '',
    district: '',
    village: '',
    latitude: '',
    longitude: ''
  });
  const [editingTechId, setEditingTechId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchTechnicians = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:5000/api/technicians', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(response.data);
    } catch (err) {
      console.error('Error loading technicians', err);
    }
  };

  const resetForm = () => {
    setFormTech({
      username: '',
      contact_number: '',
      password: '',
      district: '',
      village: '',
      latitude: '',
      longitude: ''
    });
    setEditingTechId(null);
  };

  const handleChange = (event) => {
    setFormTech({ ...formTech, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      if (editingTechId) {
        const payload = {
          contact_number: formTech.contact_number,
          district: formTech.district || null,
          village: formTech.village || null,
          latitude: formTech.latitude || null,
          longitude: formTech.longitude || null
        };

        await axios.put(`http://localhost:5000/api/technicians/${editingTechId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMessage('Technician updated successfully');
        resetForm();
        fetchTechnicians();
        return;
      }

      const payload = {
        username: formTech.username,
        password: formTech.password,
        contact_number: formTech.contact_number,
        district: formTech.district || null,
        village: formTech.village || null,
        latitude: formTech.latitude || null,
        longitude: formTech.longitude || null
      };

      await axios.post('http://localhost:5000/api/technicians', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Technician created successfully');
      resetForm();
      fetchTechnicians();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to save technician');
    }
  };

  const handleEdit = (tech) => {
    setEditingTechId(tech.id);
    setFormTech({
      username: tech.username,
      contact_number: tech.contact_number || '',
      password: '',
      district: tech.district || '',
      village: tech.village || '',
      latitude: tech.latitude || '',
      longitude: tech.longitude || ''
    });
    setMessage('Edit the fields below and click Update Technician');
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage('Edit canceled');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this technician? This cannot be undone.')) return;
    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/technicians/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Technician deleted successfully');
      if (editingTechId === id) resetForm();
      fetchTechnicians();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to delete technician');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Technician Management</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={formTech.username}
                onChange={handleChange}
                required={!editingTechId}
                disabled={!!editingTechId}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="tel"
                name="contact_number"
                value={formTech.contact_number}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          {!editingTechId && (
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formTech.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          )}
        </Row>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>District</Form.Label>
              <Form.Control name="district" value={formTech.district} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Village</Form.Label>
              <Form.Control name="village" value={formTech.village} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Latitude</Form.Label>
              <Form.Control name="latitude" value={formTech.latitude} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Longitude</Form.Label>
              <Form.Control name="longitude" value={formTech.longitude} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            {editingTechId ? 'Update Technician' : 'Create Technician'}
          </Button>
          {editingTechId && (
            <Button variant="secondary" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Contact</th>
            <th>District</th>
            <th>Village</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {technicians.map((tech) => (
            <tr key={tech.id}>
              <td>{tech.username}</td>
              <td>{tech.contact_number}</td>
              <td>{tech.district || '—'}</td>
              <td>{tech.village || '—'}</td>
              <td>{tech.latitude || '—'}</td>
              <td>{tech.longitude || '—'}</td>
              <td>
                <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEdit(tech)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(tech.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Technicians;
