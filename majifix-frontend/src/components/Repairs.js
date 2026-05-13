import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    fetchRepairs();
    fetchAssignments();
  }, []);

  const fetchRepairs = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/repairs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRepairs(response.data);
  };

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAssignments(response.data);
  };

  const handleAdd = async () => {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/repairs', {
      assignment_id: selectedAssignment,
      notes,
      cost
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setShowAdd(false);
    fetchRepairs();
  };

  return (
    <Container className="mt-5">
      <h2>Repairs</h2>
      <Button onClick={() => setShowAdd(true)} className="mb-3">Log Repair</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Water Point</th>
            <th>Technician</th>
            <th>Notes</th>
            <th>Cost</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map(repair => (
            <tr key={repair.id}>
              <td>{repair.water_point_name}</td>
              <td>{repair.technician_name}</td>
              <td>{repair.notes}</td>
              <td>{repair.cost}</td>
              <td>{new Date(repair.repair_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Log Repair</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Assignment</Form.Label>
            <Form.Select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
              <option>Select Assignment</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.issue_type}: {a.description}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cost</Form.Label>
            <Form.Control type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}>Log Repair</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Repairs;