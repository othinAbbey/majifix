
// // import React, { useEffect, useState } from "react";
// // import { Container, Table, Button, Row, Col, Card } from "react-bootstrap";
// // import { Link } from "react-router-dom";
// // import api from "../api/axios";

// // import {
// //   Chart as ChartJS,
// //   ArcElement,
// //   Tooltip,
// //   Legend,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// // } from "chart.js";

// // import { Pie, Bar } from "react-chartjs-2";

// // ChartJS.register(
// //   ArcElement,
// //   Tooltip,
// //   Legend,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement
// // );

// // const Dashboard = () => {
// //   const [waterPoints, setWaterPoints] = useState([]);
// //   const [stats, setStats] = useState({});
// //   const [assignmentStatus, setAssignmentStatus] = useState({
// //     pending: 0,
// //     in_progress: 0,
// //     completed: 0,
// //   });

// //   const [ussdCount, setUssdCount] = useState(0);

// //   useEffect(() => {
// //     fetchWaterPoints();
// //     fetchStats();
// //     fetchAssignments();
// //   }, []);

// //   // ================= WATER POINTS =================
// //   const fetchWaterPoints = async () => {
// //     const token = localStorage.getItem("token");

// //     const res = await api.get("/api/water-points", {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });

// //     const points = res.data.data || [];

// //     setWaterPoints(points);

// //     const ussd = points.filter((p) => p.created_via_ussd).length;
// //     setUssdCount(ussd);
// //   };

// //   // ================= STATS =================
// //   const fetchStats = async () => {
// //     const token = localStorage.getItem("token");

// //     const res = await api.get("/api/analytics", {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });

// //     setStats(res.data);
// //   };

// //   // ================= ASSIGNMENTS =================
// //   const fetchAssignments = async () => {
// //     const token = localStorage.getItem("token");

// //     const res = await api.get("/api/assignments", {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });

// //     const counts = res.data.reduce(
// //       (acc, a) => {
// //         const s = a.status || "pending";
// //         acc[s] = (acc[s] || 0) + 1;
// //         return acc;
// //       },
// //       { pending: 0, in_progress: 0, completed: 0 }
// //     );

// //     setAssignmentStatus(counts);
// //   };

// //   // ================= CALCULATIONS =================
// //   const totalWaterPoints = waterPoints.length;
// //   const working = stats.working || 0;
// //   const broken = stats.broken || 0;
// //   const underRepair = assignmentStatus.in_progress || 0;

// //   const pending = assignmentStatus.pending;
// //   const completed = assignmentStatus.completed;

// //   const totalAssignments = pending + underRepair + completed;

// //   const completionRate = totalAssignments
// //     ? ((completed / totalAssignments) * 100).toFixed(1)
// //     : 0;

// //   // ================= UI =================
// //   return (
// //     <Container className="mt-4">

// //       <h2 className="mb-4">MajiFix Dashboard</h2>

// //       {/* ================= CHARTS ================= */}
// //       <Row className="mb-4">

// //         {/* WATER STATUS PIE */}
// //         <Col md={4}>
// //           <Card className="p-3">
// //             <h5>Water Status</h5>
// //             <Pie
// //               data={{
// //                 labels: ["Working", "Broken"],
// //                 datasets: [
// //                   {
// //                     data: [working, broken],
// //                     backgroundColor: ["#28a745", "#dc3545"],
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Card>
// //         </Col>

// //         {/* ASSIGNMENTS BAR */}
// //         <Col md={4}>
// //           <Card className="p-3">
// //             <h5>Assignments</h5>
// //             <Bar
// //               data={{
// //                 labels: ["Pending", "In Progress", "Completed"],
// //                 datasets: [
// //                   {
// //                     label: "Tasks",
// //                     data: [
// //                       pending,
// //                       underRepair,
// //                       completed,
// //                     ],
// //                     backgroundColor: [
// //                       "#ffc107",
// //                       "#17a2b8",
// //                       "#28a745",
// //                     ],
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Card>

// //           {/* ================= SUMMARY CARD ================= */}
// //           <Card className="mt-3 p-3 text-center">
// //             <h6>System Summary</h6>

// //             <p className="mb-1">
// //               Total Water Points: <strong>{totalWaterPoints}</strong>
// //             </p>

// //             <p className="mb-1">
// //               Working: <strong style={{ color: "#28a745" }}>{working}</strong>
// //             </p>

// //             <p className="mb-1">
// //               Broken: <strong style={{ color: "#dc3545" }}>{broken}</strong>
// //             </p>

// //             <p className="mb-1">
// //               Under Repair: <strong style={{ color: "#17a2b8" }}>{underRepair}</strong>
// //             </p>

// //             <p className="mb-1">
// //               USSD Points: <strong>{ussdCount}</strong>
// //             </p>

// //             <hr />

// //             <p className="mb-0">
// //               Completion Rate:{" "}
// //               <strong style={{ color: "#28a745" }}>
// //                 {completionRate}%
// //               </strong>
// //             </p>
// //           </Card>
// //         </Col>

// //         {/* USSD VS MANUAL */}
// //         <Col md={4}>
// //           <Card className="p-3">
// //             <h5>Registration Source</h5>
// //             <Pie
// //               data={{
// //                 labels: ["USSD", "Manual"],
// //                 datasets: [
// //                   {
// //                     data: [
// //                       ussdCount,
// //                       totalWaterPoints - ussdCount,
// //                     ],
// //                     backgroundColor: ["#007bff", "#6c757d"],
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Card>
// //         </Col>

// //       </Row>

// //       {/* ================= ACTION BUTTONS ================= */}
// //       <div className="mb-3 d-flex gap-2 flex-wrap">
// //         <Button as={Link} to="/report-fault">Report Fault</Button>
// //         <Button as={Link} to="/add-water-point">Add Water Point</Button>
// //         <Button as={Link} to="/water-points">View Water Points</Button>
// //         <Button as={Link} to="/map" variant="success">Map View</Button>
// //       </div>

// //       {/* ================= TABLE ================= */}
// //       <Table striped bordered hover>
// //         <thead>
// //           <tr>
// //             <th>Name</th>
// //             <th>District</th>
// //             <th>Village</th>
// //             <th>Status</th>
// //             <th>Type</th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {waterPoints.map((p) => (
// //             <tr key={p.id}>
// //               <td>{p.name}</td>
// //               <td>{p.district}</td>
// //               <td>{p.village}</td>
// //               <td>{p.status}</td>
// //               <td>{p.water_source_type}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </Table>

// //     </Container>
// //   );
// // };

// // export default Dashboard;

// import React, { useEffect, useState } from "react";
// import { Container, Table, Button, Row, Col, Card } from "react-bootstrap";
// import { Link } from "react-router-dom";
// import api from "../api/axios";

// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
// } from "chart.js";

// import { Pie, Bar } from "react-chartjs-2";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement
// );

// const Dashboard = () => {
//   const [waterPoints, setWaterPoints] = useState([]);
//   const [stats, setStats] = useState({});
//   const [assignmentStatus, setAssignmentStatus] = useState({
//     pending: 0,
//     in_progress: 0,
//     completed: 0,
//   });

//   const [ussdCount, setUssdCount] = useState(0);

//   useEffect(() => {
//     fetchWaterPoints();
//     fetchStats();
//     fetchAssignments();
//   }, []);

//   // ================= WATER POINTS =================
//   const fetchWaterPoints = async () => {
//     const token = localStorage.getItem("token");

//     const res = await api.get("/api/water-points", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const points = res.data.data || [];

//     setWaterPoints(points);

//     const ussd = points.filter((p) => p.created_via_ussd).length;
//     setUssdCount(ussd);
//   };

//   // ================= STATS =================
//   const fetchStats = async () => {
//     const token = localStorage.getItem("token");

//     const res = await api.get("/api/analytics", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     setStats(res.data);
//   };

//   // ================= ASSIGNMENTS =================
//   const fetchAssignments = async () => {
//     const token = localStorage.getItem("token");

//     const res = await api.get("/api/assignments", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const counts = res.data.reduce(
//       (acc, a) => {
//         const s = a.status || "pending";
//         acc[s] = (acc[s] || 0) + 1;
//         return acc;
//       },
//       { pending: 0, in_progress: 0, completed: 0 }
//     );

//     setAssignmentStatus(counts);
//   };

//   // ================= CALCULATIONS =================
//   const totalWaterPoints = waterPoints.length;
//   const working = stats.working || 0;
//   const broken = stats.broken || 0;
//   const underRepair = assignmentStatus.in_progress || 0;

//   const pending = assignmentStatus.pending;
//   const completed = assignmentStatus.completed;

//   const totalAssignments = pending + underRepair + completed;

//   const completionRate = totalAssignments
//     ? ((completed / totalAssignments) * 100).toFixed(1)
//     : 0;

//   // ================= WATER SOURCE TYPE =================
//   const sourceTypeCounts = waterPoints.reduce((acc, point) => {
//     const type = point.water_source_type || "unknown";
//     acc[type] = (acc[type] || 0) + 1;
//     return acc;
//   }, {});

//   const sourceLabels = Object.keys(sourceTypeCounts);
//   const sourceValues = Object.values(sourceTypeCounts);

//   // ================= UI =================
//   return (
//     <Container className="mt-4">

//       <h2 className="mb-4">MajiFix Dashboard</h2>

//       {/* ================= CHARTS ROW ================= */}
//       <Row className="mb-4">

//         {/* WATER STATUS */}
//         <Col md={4}>
//           <Card className="p-3">
//             <h5>Water Status</h5>
//             <Pie
//               data={{
//                 labels: ["Working", "Broken"],
//                 datasets: [
//                   {
//                     data: [working, broken],
//                     backgroundColor: ["#28a745", "#dc3545"],
//                   },
//                 ],
//               }}
//             />
//           </Card>
//         </Col>

//         {/* ASSIGNMENTS */}
//         <Col md={4}>
//           <Card className="p-3">
//             <h5>Assignments</h5>
//             <Bar
//               data={{
//                 labels: ["Pending", "In Progress", "Completed"],
//                 datasets: [
//                   {
//                     data: [
//                       pending,
//                       underRepair,
//                       completed,
//                     ],
//                     backgroundColor: [
//                       "#ffc107",
//                       "#17a2b8",
//                       "#28a745",
//                     ],
//                   },
//                 ],
//               }}
//             />
//           </Card>
//         </Col>

//         {/* SYSTEM SUMMARY */}
//         <Col md={4}>
//           <Card className="p-3 text-center">
//             <h5>System Summary</h5>

//             <p>Total: <b>{totalWaterPoints}</b></p>
//             <p>Working: <b style={{ color: "green" }}>{working}</b></p>
//             <p>Broken: <b style={{ color: "red" }}>{broken}</b></p>
//             <p>USSD: <b>{ussdCount}</b></p>

//             <hr />

//             <p>
//               Completion Rate:{" "}
//               <b style={{ color: "green" }}>
//                 {completionRate}%
//               </b>
//             </p>
//           </Card>
//         </Col>
//       </Row>

//       {/* ================= SECOND CHART ROW ================= */}
//       <Row className="mb-4">

//         {/* WATER SOURCE TYPE */}
//         <Col md={4}>
//           <Card className="p-3">
//             <h5>Water Source Types</h5>

//             <Pie
//               data={{
//                 labels: sourceLabels,
//                 datasets: [
//                   {
//                     data: sourceValues,
//                     backgroundColor: [
//                       "#007bff",
//                       "#28a745",
//                       "#ffc107",
//                       "#17a2b8",
//                       "#dc3545",
//                       "#6f42c1",
//                     ],
//                   },
//                 ],
//               }}
//             />
//           </Card>
//         </Col>

//       </Row>

//       {/* ================= ACTIONS ================= */}
//       <div className="mb-3 d-flex gap-2 flex-wrap">
//         <Button as={Link} to="/report-fault">Report Fault</Button>
//         <Button as={Link} to="/add-water-point">Add Water Point</Button>
//         <Button as={Link} to="/water-points">View Water Points</Button>
//         <Button as={Link} to="/map" variant="success">Map View</Button>
//       </div>

//       {/* ================= TABLE ================= */}
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
//           {waterPoints.map((p) => (
//             <tr key={p.id}>
//               <td>{p.name}</td>
//               <td>{p.district}</td>
//               <td>{p.village}</td>
//               <td>{p.status}</td>
//               <td>{p.water_source_type}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

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

  // ================= FETCH =================
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
  };

  // ================= STATS =================
  const fetchStats = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/api/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStats(res.data || {});
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

  // ================= DERIVED DATA =================
  const totalWaterPoints = waterPoints.length;

  const working = waterPoints.filter((p) => p.status === "working").length;
  const broken = waterPoints.filter((p) => p.status === "broken").length;
  const underRepair = assignmentStatus.in_progress;

  const ussdCount = waterPoints.filter((p) => p.created_via_ussd).length;
  const manualCount = totalWaterPoints - ussdCount;

  // Water source type breakdown
  const borehole = waterPoints.filter(p => p.water_source_type === "borehole").length;
  const well = waterPoints.filter(p => p.water_source_type === "well").length;
  const spring = waterPoints.filter(p => p.water_source_type === "spring").length;

  // ================= UI =================
  return (
    <Container className="mt-4">
      <h2 className="mb-4">MajiFix Dashboard</h2>

      {/* ================= CHARTS ROW ================= */}
      <Row className="mb-4">

        {/* WATER STATUS */}
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

        {/* ASSIGNMENTS */}
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
                      assignmentStatus.pending,
                      assignmentStatus.in_progress,
                      assignmentStatus.completed,
                    ],
                    backgroundColor: ["#ffc107", "#17a2b8", "#28a745"],
                  },
                ],
              }}
            />
          </Card>
        </Col>

        {/* USSD VS MANUAL */}
        <Col md={4}>
          <Card className="p-3">
            <h5>Data Source</h5>
            <Pie
              data={{
                labels: ["USSD", "Manual"],
                datasets: [
                  {
                    data: [ussdCount, manualCount],
                    backgroundColor: ["#007bff", "#6c757d"],
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* ================= SUMMARY ================= */}
      <Card className="p-3 mb-4">
        <h5>System Summary</h5>

        <Row>
          <Col md={3}>Total: <b>{totalWaterPoints}</b></Col>
          <Col md={3}>Working: <b style={{ color: "green" }}>{working}</b></Col>
          <Col md={3}>Broken: <b style={{ color: "red" }}>{broken}</b></Col>
          <Col md={3}>Under Repair: <b>{underRepair}</b></Col>
        </Row>
      </Card>

      {/* ================= WATER SOURCE TYPE ================= */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3">
            <h5>Water Source Types</h5>
            <Pie
              data={{
                labels: ["Borehole", "Well", "Spring"],
                datasets: [
                  {
                    data: [borehole, well, spring],
                    backgroundColor: ["#20c997", "#6610f2", "#fd7e14"],
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* ================= ACTIONS ================= */}
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
            <th>Source</th>
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
              <td>{p.created_via_ussd ? "USSD" : "Manual"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Dashboard;