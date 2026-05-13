import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

const ReportFault = () => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [waterPointId, setWaterPointId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchWaterPoints = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/water-points', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWaterPoints(response.data);
    };
    fetchWaterPoints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/fault-reports', {
        water_point_id: waterPointId,
        issue_type: issueType,
        description,
        image_url: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Fault reported successfully');
    } catch (err) {
      setMessage('Error reporting fault');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Report Fault</h2>
      {message && <Alert variant={message.includes('success') ? 'success' : 'danger'}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Water Point</Form.Label>
          <Form.Select value={waterPointId} onChange={(e) => setWaterPointId(e.target.value)} required>
            <option value="">Select Water Point</option>
            {waterPoints.map(point => (
              <option key={point.id} value={point.id}>{point.name} - {point.village}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Issue Type</Form.Label>
          <Form.Select value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
            <option value="">Select Issue</option>
            <option value="no_water">No Water</option>
            <option value="low_pressure">Low Pressure</option>
            <option value="broken_pump">Broken Pump</option>
            <option value="leakage">Leakage</option>
            <option value="contamination">Contamination</option>
            <option value="vandalism">Vandalism</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image URL (optional)</Form.Label>
          <Form.Control type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">Submit Report</Button>
      </Form>
    </Container>
  );
};

export default ReportFault;