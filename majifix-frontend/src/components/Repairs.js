import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';
// import axios from 'axios';
// const API_URL = process.env.REACT_APP_API_URL;
import api from '../api/axios';
const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [transportCost, setTransportCost] = useState('');
  const [materialsCost, setMaterialsCost] = useState('');
  const [problemFound, setProblemFound] = useState('');
  const [remedy, setRemedy] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRepairs();
    fetchAssignments();
  }, []);

  const fetchRepairs = async () => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/api/repairs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRepairs(response.data);
  };

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/api/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAssignments(response.data);
  };

  const handleAdd = async () => {
    const token = localStorage.getItem('token');
    await api.post(`/api/repairs`, {
      assignment_id: selectedAssignment,
      transport_cost: transportCost,
      materials_cost: materialsCost,
      problem_found: problemFound,
      remedy,
      additional_notes: notes
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
            <th>Problem</th>
            <th>Remedy</th>
            <th>Transport</th>
            <th>Materials</th>
            <th>Notes</th>
            <th>Total Cost</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map(repair => (
            <tr key={repair.id}>
              <td>{repair.water_point_name}</td>
              <td>{repair.technician_name}</td>
              <td>{repair.problem_found}</td>
              <td>{repair.remedy}</td>
              <td>{repair.transport_cost}</td>
              <td>{repair.materials_cost}</td>
              <td>{repair.additional_notes}</td>
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
              <option value="">Select Assignment</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.issue_type}: {a.description}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Transport cost (KES)</Form.Label>
            <Form.Control type="number" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Materials cost (KES)</Form.Label>
            <Form.Control type="number" value={materialsCost} onChange={(e) => setMaterialsCost(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Problem found</Form.Label>
            <Form.Control type="text" value={problemFound} onChange={(e) => setProblemFound(e.target.value)} placeholder="e.g. broken seals" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Remedy</Form.Label>
            <Form.Control type="text" value={remedy} onChange={(e) => setRemedy(e.target.value)} placeholder="e.g. new part bought" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Additional notes</Form.Label>
            <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
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