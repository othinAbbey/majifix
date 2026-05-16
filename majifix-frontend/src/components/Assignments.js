import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [faultReports, setFaultReports] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedFault, setSelectedFault] = useState('');
  const [selectedTech, setSelectedTech] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchFaultReports();
    fetchTechnicians();
  }, []);

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAssignments(response.data);
  };

  const fetchFaultReports = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/fault-reports', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFaultReports(response.data);
  };

  const fetchTechnicians = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5000/api/technicians', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(response.data);
    } catch (err) {
      console.error('Error loading technicians', err);
      setTechnicians([]);
    }
  };

  const handleAssign = async () => {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/assignments', {
      fault_report_id: selectedFault,
      technician_id: selectedTech
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShowAssign(false);
    fetchAssignments();
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/assignments/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAssignments();
  };

  return (
    <Container className="mt-5">
      <h2>Assignments</h2>
      <Button onClick={() => setShowAssign(true)} className="mb-3">Assign Technician</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Fault</th>
            <th>Technician</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(assignment => (
            <tr key={assignment.id}>
              <td>{assignment.issue_type}: {assignment.description}</td>
              <td>{assignment.technician_name}</td>
              <td>{assignment.status}</td>
              <td>{assignment.priority}</td>
              <td>
                <Button size="sm" onClick={() => updateStatus(assignment.id, 'in_progress')}>Start</Button>
                <Button size="sm" onClick={() => updateStatus(assignment.id, 'completed')}>Complete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showAssign} onHide={() => setShowAssign(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Technician</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Fault Report</Form.Label>
            <Form.Select value={selectedFault} onChange={(e) => setSelectedFault(e.target.value)}>
              <option>Select Fault</option>
              {faultReports.map(fr => (
                <option key={fr.id} value={fr.id}>{fr.issue_type}: {fr.description}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Technician</Form.Label>
            <Form.Select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
              <option>Select Technician</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.username}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssign}>Assign</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Assignments;