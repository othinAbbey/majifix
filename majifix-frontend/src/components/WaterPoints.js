// import React, { useEffect, useState } from "react";
// import { Container, Table, Button } from "react-bootstrap";
// // import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { Link } from "react-router-dom";
// import api from "../api/axios";
// // const API_URL = process.env.REACT_APP_API_URL;

// const WaterPoints = () => {
//   const [waterPoints, setWaterPoints] = useState([]);

//   // ==========================
//   // Decode user safely
//   // ==========================
//   const token = localStorage.getItem("token");

//   let user = null;

//   if (token) {
//     try {
//       user = jwtDecode(token);
//     } catch (err) {
//       console.error("Invalid token");
//       user = null;
//     }
//   }

//   const isAdmin = user?.role === "admin";

//   // ==========================
//   // Fetch water points
//   // ==========================
//   useEffect(() => {
//     fetchWaterPoints();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchWaterPoints = async () => {
//     const token = localStorage.getItem("token");
//   // await new Promise(resolve => setTimeout(resolve, 3000));
//     try {
//       const response = await api.get(
//         //only admins can see all water points, others see only those they created
//         isAdmin
//           ? `${API_URL}/api/water-points`
//           : `${API_URL}/api/water-points/user`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );

//       // IMPORTANT FIX 👇
//       setWaterPoints(response.data.data || []);
//     } catch (err) {
//       console.error("Error fetching water points:", err);
//       setWaterPoints([]);
//     }
//   };

//   // ==========================
//   // UI
//   // ==========================
//   return (
//     <Container className="mt-5">
//       <h2>Water Points</h2>

//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>District</th>
//                       <th>Status</th>
//             <th>Parish</th>
//             <th>Village</th>
//             <th>Water Point Number</th>
//             <th>Latitude</th>
//             <th>Longitude</th>
//             <th>Created</th>
//           </tr>
//         </thead>

//         <tbody>
//           {waterPoints.map((wp) => (
//             <tr key={wp.id}>
//               <td>{wp.name}</td>
//               <td>{wp.district}</td>
//               <td>{wp.status}</td>
//               <td>{wp.parish}</td>
//               <td>{wp.village}</td>
//               <td>{wp.water_point_code}</td>
//               <td>{wp.latitude}</td>
//               <td>{wp.longitude}</td>

//               <td>{new Date(wp.created_at).toLocaleDateString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       <Button as={Link} to="/add-water-point" variant="primary">
//         + Add Water Point
//       </Button>
//       <Button href="/map" variant="success">
//   View Map
// </Button>
//     </Container>
//   );
// };

// export default WaterPoints;

import React, { useEffect, useState, useCallback } from "react";
import { Container, Table, Button } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import api from "../api/axios";

const WaterPoints = () => {
  const [waterPoints, setWaterPoints] = useState([]);

  // ==========================
  // Decode user safely
  // ==========================
  const token = localStorage.getItem("token");

  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const isAdmin = user?.role === "admin";

  // ==========================
  // FETCH FUNCTION
  // ==========================
  const fetchWaterPoints = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await api.get(
        isAdmin ? "/api/water-points" : "/api/water-points/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data || response.data;

      setWaterPoints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching water points:", err);
      setWaterPoints([]);
    }
  }, [isAdmin]);

  // ==========================
  // EFFECT
  // ==========================
  useEffect(() => {
    fetchWaterPoints();
  }, [fetchWaterPoints]);

  // ==========================
  // UI
  // ==========================
  return (
    <Container className="mt-5">
      <h2>Water Points</h2>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>District</th>
            <th>Status</th>
            <th>Parish</th>
            <th>Village</th>
            <th>Water Point Number</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {waterPoints.map((wp) => (
            <tr key={wp.id}>
              <td>{wp.name}</td>
              <td>{wp.district}</td>
              <td>{wp.status}</td>
              <td>{wp.parish}</td>
              <td>{wp.village}</td>
              <td>{wp.water_point_code}</td>
              <td>{wp.latitude}</td>
              <td>{wp.longitude}</td>
              <td>
                {wp.created_at
                  ? new Date(wp.created_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button as={Link} to="/add-water-point" variant="primary">
        + Add Water Point
      </Button>

      <Button as={Link} to="/map" variant="success" className="ms-2">
        View Map
      </Button>
    </Container>
  );
};

export default WaterPoints;