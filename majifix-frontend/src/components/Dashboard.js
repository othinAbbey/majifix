// import React, { useEffect, useState } from 'react';
// import { Container, Table, Button, Row, Col, Card, Badge } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// // import axios from 'axios';
// // const API_URL = process.env.REACT_APP_API_URL;
// import api from '../api/axios';
// const Dashboard = () => {
//   const [waterPoints, setWaterPoints] = useState([]);
//   const [stats, setStats] = useState({});
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [assignmentStatus, setAssignmentStatus] = useState({ pending: 0, in_progress: 0, completed: 0 });
//   const [recentNotifications, setRecentNotifications] = useState([]);
//   const [recentAssignments, setRecentAssignments] = useState([]);
//   const [recentWaterPoints, setRecentWaterPoints] = useState([]);
//   const [ussdRegistrationCount, setUssdRegistrationCount] = useState(0);

//   useEffect(() => {
//     fetchWaterPoints();
//     fetchStats();
//     fetchNotifications();
//     fetchAssignmentStatus();
//   }, []);

//   const fetchWaterPoints = async () => {
//     const token = localStorage.getItem('token');
//     const response = await api.get(`/api/water-points`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     const points = response.data.data;
//     setWaterPoints(points);
//     setRecentWaterPoints(points.slice(-5).reverse());
//     setUssdRegistrationCount(points.filter((point) => point.created_via_ussd).length);
//   };

//   const fetchStats = async () => {
//     const token = localStorage.getItem('token');
//     const response = await api.get(`/api/analytics`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     setStats(response.data);
//   };

//   const fetchNotifications = async () => {
//     const token = localStorage.getItem('token');
//     const response = await api.get(`/api/notifications`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     const unread = response.data.filter((notification) => !notification.is_read).length;
//     setNotificationCount(unread);
//     setRecentNotifications(response.data.slice(0, 5));
//   };

//   const fetchAssignmentStatus = async () => {
//     const token = localStorage.getItem('token');
//     const response = await api.get(`/api/assignments`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     const counts = response.data.reduce(
//       (acc, assignment) => {
//         const status = assignment.status || 'pending';
//         acc[status] = (acc[status] || 0) + 1;
//         return acc;
//       },
//       { pending: 0, in_progress: 0, completed: 0 }
//     );
//     setAssignmentStatus(counts);
//     setRecentAssignments(response.data.slice(0, 5));
//   };

//   return (
//     <Container className="mt-4">
//       <h1 className="mb-4">Dashboard</h1>
      
//       {/* Stats Summary */}
//       <Row className="mb-4">
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-primary">{stats.waterPoints || 0}</h3>
//               <p>Total Water Points</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-success">{stats.working || 0}</h3>
//               <p>Working Systems</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-danger">{stats.broken || 0}</h3>
//               <p>Broken Systems</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-warning">{stats.assignments || 0}</h3>
//               <p>Assignments</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-info">{notificationCount}</h3>
//               <p>Unread Notifications</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-secondary">{ussdRegistrationCount}</h3>
//               <p>USSD Water Points</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-secondary">{assignmentStatus.pending || 0}</h3>
//               <p>Pending Assignments</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2} className="mt-3 mt-md-0">
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-info">{assignmentStatus.in_progress || 0}</h3>
//               <p>In Progress</p>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2} className="mt-3 mt-md-0">
//           <Card className="text-center">
//             <Card.Body>
//               <h3 className="text-success">{assignmentStatus.completed || 0}</h3>
//               <p>Completed</p>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <h3 className="mb-3">Water Points</h3>
//       <div className="mb-3 d-flex gap-2 flex-wrap">
//         <Button as={Link} to="/report-fault" variant="primary">+ Report Fault</Button>
//         <Button as={Link} to="/add-water-point" variant="success">+ Add Water Point</Button>
//         <Button as={Link} to="/water-points" variant="success">View Water Points</Button>
//       </div>
      
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>District</th>
//             <th>Village</th>
//             <th>Status</th>
//             <th>Type</th>
//           </tr>
//         </thead>
//         <tbody>
//           {waterPoints.map(point => (
//             <tr key={point.id}>
//               <td>{point.name}</td>
//               <td>{point.district}</td>
//               <td>{point.village}</td>
//               <td>
//                 <span className={`badge bg-${point.status === 'working' ? 'success' : 'danger'}`}>
//                   {point.status}
//                 </span>
//               </td>
//               <td>{point.water_source_type}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       <Row className="mt-4">
//         <Col md={4} className="mb-4">
//           <Card>
//             <Card.Body>
//               <h4>Recent Notifications</h4>
//               {recentNotifications.length === 0 ? (
//                 <p className="text-muted">No notifications yet.</p>
//               ) : (
//                 <ul className="list-unstyled">
//                   {recentNotifications.map((notification) => (
//                     <li key={notification.id} className="mb-2">
//                       <strong>{notification.type}</strong>: {notification.message}
//                       {!notification.is_read && <Badge bg="primary" className="ms-2">New</Badge>}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//               <Button as={Link} to="/notifications" size="sm" variant="outline-primary">
//                 View all notifications
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4} className="mb-4">
//           <Card>
//             <Card.Body>
//               <h4>Recent Assignments</h4>
//               {recentAssignments.length === 0 ? (
//                 <p className="text-muted">No assignments yet.</p>
//               ) : (
//                 <Table size="sm" bordered>
//                   <thead>
//                     <tr>
//                       <th>Fault</th>
//                       <th>Technician</th>
//                       <th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {recentAssignments.map((assignment) => (
//                       <tr key={assignment.id}>
//                         <td>{assignment.issue_type}</td>
//                         <td>{assignment.technician_name}</td>
//                         <td>{assignment.status}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               )}
//               <Button as={Link} to="/assignments" size="sm" variant="outline-primary">
//                 View all assignments
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4} className="mb-4">
//           <Card>
//             <Card.Body>
//               <h4>Recent Water Points</h4>
//               {recentWaterPoints.length === 0 ? (
//                 <p className="text-muted">No water points created yet.</p>
//               ) : (
//                 <ul className="list-unstyled">
//                   {recentWaterPoints.map((point) => (
//                     <li key={point.id} className="mb-2">
//                       <strong>{point.name}</strong> - {point.district}, {point.parish}, {point.village}
//                       <br />
//                       <small>
//                         {point.water_source_type || 'unknown source'} • {point.status}
//                         {point.created_via_ussd && (
//                           <Badge bg="info" className="ms-2">USSD</Badge>
//                         )}
//                       </small>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//               <Button as={Link} to="/water-points" size="sm" variant="outline-primary">
//                 View water points
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from "react";
import { Container, Table, Button, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api/axios";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const [waterPoints, setWaterPoints] = useState([]);
  const [stats, setStats] = useState({});
  const [assignmentStatus, setAssignmentStatus] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
  });

  const [ussdCount, setUssdCount] = useState(0);

  useEffect(() => {
    fetchWaterPoints();
    fetchStats();
    fetchAssignments();
  }, []);

  // ================= WATER POINTS =================
  const fetchWaterPoints = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/api/water-points", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const points = res.data.data || [];

    setWaterPoints(points);

    const ussd = points.filter((p) => p.created_via_ussd).length;
    setUssdCount(ussd);
  };

  // ================= STATS =================
  const fetchStats = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/api/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStats(res.data);
  };

  // ================= ASSIGNMENTS =================
  const fetchAssignments = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/api/assignments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const counts = res.data.reduce(
      (acc, a) => {
        const s = a.status || "pending";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { pending: 0, in_progress: 0, completed: 0 }
    );

    setAssignmentStatus(counts);
  };

  // ================= CALCULATIONS =================
  const totalWaterPoints = waterPoints.length;
  const working = stats.working || 0;
  const broken = stats.broken || 0;
  const underRepair = assignmentStatus.in_progress || 0;

  const pending = assignmentStatus.pending;
  const completed = assignmentStatus.completed;

  const totalAssignments = pending + underRepair + completed;

  const completionRate = totalAssignments
    ? ((completed / totalAssignments) * 100).toFixed(1)
    : 0;

  // ================= UI =================
  return (
    <Container className="mt-4">

      <h2 className="mb-4">MajiFix Dashboard</h2>

      {/* ================= CHARTS ================= */}
      <Row className="mb-4">

        {/* WATER STATUS PIE */}
        <Col md={4}>
          <Card className="p-3">
            <h5>Water Status</h5>
            <Pie
              data={{
                labels: ["Working", "Broken"],
                datasets: [
                  {
                    data: [working, broken],
                    backgroundColor: ["#28a745", "#dc3545"],
                  },
                ],
              }}
            />
          </Card>
        </Col>

        {/* ASSIGNMENTS BAR */}
        <Col md={4}>
          <Card className="p-3">
            <h5>Assignments</h5>
            <Bar
              data={{
                labels: ["Pending", "In Progress", "Completed"],
                datasets: [
                  {
                    label: "Tasks",
                    data: [
                      pending,
                      underRepair,
                      completed,
                    ],
                    backgroundColor: [
                      "#ffc107",
                      "#17a2b8",
                      "#28a745",
                    ],
                  },
                ],
              }}
            />
          </Card>

          {/* ================= SUMMARY CARD ================= */}
          <Card className="mt-3 p-3 text-center">
            <h6>System Summary</h6>

            <p className="mb-1">
              Total Water Points: <strong>{totalWaterPoints}</strong>
            </p>

            <p className="mb-1">
              Working: <strong style={{ color: "#28a745" }}>{working}</strong>
            </p>

            <p className="mb-1">
              Broken: <strong style={{ color: "#dc3545" }}>{broken}</strong>
            </p>

            <p className="mb-1">
              Under Repair: <strong style={{ color: "#17a2b8" }}>{underRepair}</strong>
            </p>

            <p className="mb-1">
              USSD Points: <strong>{ussdCount}</strong>
            </p>

            <hr />

            <p className="mb-0">
              Completion Rate:{" "}
              <strong style={{ color: "#28a745" }}>
                {completionRate}%
              </strong>
            </p>
          </Card>
        </Col>

        {/* USSD VS MANUAL */}
        <Col md={4}>
          <Card className="p-3">
            <h5>Registration Source</h5>
            <Pie
              data={{
                labels: ["USSD", "Manual"],
                datasets: [
                  {
                    data: [
                      ussdCount,
                      totalWaterPoints - ussdCount,
                    ],
                    backgroundColor: ["#007bff", "#6c757d"],
                  },
                ],
              }}
            />
          </Card>
        </Col>

      </Row>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button as={Link} to="/report-fault">Report Fault</Button>
        <Button as={Link} to="/add-water-point">Add Water Point</Button>
        <Button as={Link} to="/water-points">View Water Points</Button>
        <Button as={Link} to="/map" variant="success">Map View</Button>
      </div>

      {/* ================= TABLE ================= */}
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
          {waterPoints.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.district}</td>
              <td>{p.village}</td>
              <td>{p.status}</td>
              <td>{p.water_source_type}</td>
            </tr>
          ))}
        </tbody>
      </Table>

    </Container>
  );
};

export default Dashboard;