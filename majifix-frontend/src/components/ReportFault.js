import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ReportFault = () => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [waterPointId, setWaterPointId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================
  // FETCH WATER POINTS
  // ==========================
  useEffect(() => {

    const fetchWaterPoints = async () => {

      try {

        const token = localStorage.getItem('token');

        console.log('🚀 FETCHING WATER POINTS');

        const response = await axios.get(
          'https://majifix.onrender.com/api/water-points',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('✅ WATER POINTS:', response.data);

        setWaterPoints(response.data);

      } catch (err) {

        console.log('❌ WATER POINT FETCH ERROR');

        if (err.response) {
          console.log(err.response.data);
        } else {
          console.log(err.message);
        }

        setMessage('Failed to load water points');
      }
    };

    fetchWaterPoints();

  }, []);

  // ==========================
  // SUBMIT FAULT
  // ==========================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {

      const token = localStorage.getItem('token');

      const payload = {
        water_point_id: waterPointId,
        issue_type: issueType,
        description,
        image_url: imageUrl,
      };

      console.log('🚀 SUBMITTING FAULT');
      console.log(payload);

      const response = await axios.post(
        'https://majifix.onrender.com/api/fault-reports',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ BACKEND RESPONSE:', response.data);

      const assignment = response.data.assignment;

      setMessage(
        `Fault reported successfully${
          assignment
            ? ` and assigned to ${assignment?.technician?.username || 'technician'}`
            : ''
        }`
      );

      // ==========================
      // RESET FORM
      // ==========================
      setWaterPointId('');
      setIssueType('');
      setDescription('');
      setImageUrl('');

    } catch (err) {

      console.log('❌ FRONTEND ERROR');

      if (err.response) {

        console.log('📡 RESPONSE DATA:', err.response.data);
        console.log('📡 STATUS:', err.response.status);

        setMessage(
          err.response.data?.error ||
          err.response.data?.message ||
          'Backend returned an error'
        );

      } else if (err.request) {

        console.log('📡 SERVER NOT RESPONDING');

        setMessage('Server not responding');

      } else {

        console.log('❌ AXIOS ERROR:', err.message);

        setMessage(err.message);
      }

    } finally {

      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">

      <h2>Report Fault</h2>

      {message && (
        <Alert
          variant={
            message.toLowerCase().includes('success')
              ? 'success'
              : 'danger'
          }
        >
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>

        {/* WATER POINT */}
        <Form.Group className="mb-3">
          <Form.Label>Water Point</Form.Label>

          <Form.Select
            value={waterPointId}
            onChange={(e) => setWaterPointId(e.target.value)}
            required
          >
            <option value="">Select Water Point</option>

            {waterPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} - {point.village}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* ISSUE TYPE */}
        <Form.Group className="mb-3">
          <Form.Label>Issue Type</Form.Label>

          <Form.Select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
          >
            <option value="">Select Issue</option>

            <option value="no_water">No Water</option>
            <option value="low_pressure">Low Pressure</option>
            <option value="broken_pump">Broken Pump</option>
            <option value="leakage">Leakage</option>
            <option value="contamination">Contamination</option>
            <option value="vandalism">Vandalism</option>
          </Form.Select>
        </Form.Group>

        {/* DESCRIPTION */}
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>

          <Form.Control
            as="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the fault..."
          />
        </Form.Group>

        {/* IMAGE URL */}
        <Form.Group className="mb-3">
          <Form.Label>Image URL (optional)</Form.Label>

          <Form.Control
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </Form.Group>

        {/* BUTTON */}
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
              />
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>

      </Form>
    </Container>
  );
};

export default ReportFault;