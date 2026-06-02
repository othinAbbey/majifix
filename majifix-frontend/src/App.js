// // import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// // import api from "./api/axios";
// // import 'bootstrap/dist/css/bootstrap.min.css';
// // import Login from './components/Login';
// // import Dashboard from './components/Dashboard';
// // import ReportFault from './components/ReportFault';
// // import AddWaterPoint from './components/AddWaterPoint';
// // import Assignments from './components/Assignments';
// // import Repairs from './components/Repairs';
// // import Analytics from './components/Analytics';
// // import Notifications from './components/Notifications';
// // import Technicians from './components/Technicians';
// // import Navigation from './components/Navigation';
// // import WaterPoints from './components/WaterPoints';
// // import WaterPointsMap from './components/WaterPointsMap';
// // import LoadingOverlay from './components/LoadingOverlay';
// // import { useLoading } from "./components/LoadingContext";
// // function AppContent() {
// //   const location = useLocation();
// //   const isLoginPage = location.pathname === '/';
// //  const { loading} = useLoading();
// //   return (
// //     <>
// //       {!isLoginPage && <Navigation />}
// //       {loading && <LoadingOverlay />}
// //       <Routes>
// //         <Route path="/" element={<Login />} />
// //         <Route path="/dashboard" element={<Dashboard />} />
// //         <Route path="/report-fault" element={<ReportFault />} />
// //         <Route path="/add-water-point" element={<AddWaterPoint />} />
// //         <Route path="/water-points" element={<WaterPoints />} />
// //         <Route path="/assignments" element={<Assignments />} />
// //         <Route path="/repairs" element={<Repairs />} />
// //         <Route path="/analytics" element={<Analytics />} />
// //         <Route path="/notifications" element={<Notifications />} />
// //         <Route path="/technicians" element={<Technicians />} />
// //         <Route path="/map" element={<WaterPointsMap />} />
// //       </Routes>
// //     </>
// //   );
// // }

// // function App() {
// //   return (
// //     <Router>
// //       <AppContent />
// //     </Router>
// //   );
// // }

// // export default App;
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import { useEffect } from "react";

// import "bootstrap/dist/css/bootstrap.min.css";

// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";
// import ReportFault from "./components/ReportFault";
// import AddWaterPoint from "./components/AddWaterPoint";
// import Assignments from "./components/Assignments";
// import Repairs from "./components/Repairs";
// import Analytics from "./components/Analytics";
// import Notifications from "./components/Notifications";
// import Technicians from "./components/Technicians";
// import Navigation from "./components/Navigation";
// import WaterPoints from "./components/WaterPoints";
// import WaterPointsMap from "./components/WaterPointsMap";

// import LoadingOverlay from "./components/LoadingOverlay";
// import { useLoading } from "./components/LoadingContext";

// import api from "./api/axios";

// function AppContent() {
//   const location = useLocation();
//   const isLoginPage = location.pathname === "/";

//   const { loading, setLoading } = useLoading();

//   // ==========================
//   // AXIOS GLOBAL LOADER HOOK
//   // ==========================
//   useEffect(() => {
//     const requestInterceptor = api.interceptors.request.use(
//       (config) => {
//         setLoading(true);
//         return config;
//       },
//       (error) => {
//         setLoading(false);
//         return Promise.reject(error);
//       }
//     );

//     const responseInterceptor = api.interceptors.response.use(
//       (response) => {
//         setLoading(false);
//         return response;
//       },
//       (error) => {
//         setLoading(false);
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       api.interceptors.request.eject(requestInterceptor);
//       api.interceptors.response.eject(responseInterceptor);
//     };
//   }, [setLoading]);

//   return (
//     <>
//       {/* NAVIGATION */}
//       {!isLoginPage && <Navigation />}

//       {/* GLOBAL LOADER */}
//       {loading && <LoadingOverlay />}

//       {/* ROUTES */}
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/report-fault" element={<ReportFault />} />
//         <Route path="/add-water-point" element={<AddWaterPoint />} />
//         <Route path="/water-points" element={<WaterPoints />} />
//         <Route path="/assignments" element={<Assignments />} />
//         <Route path="/repairs" element={<Repairs />} />
//         <Route path="/analytics" element={<Analytics />} />
//         <Route path="/notifications" element={<Notifications />} />
//         <Route path="/technicians" element={<Technicians />} />
//         <Route path="/map" element={<WaterPointsMap />} />
//       </Routes>
//     </>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ReportFault from "./components/ReportFault";
import AddWaterPoint from "./components/AddWaterPoint";
import Assignments from "./components/Assignments";
import Repairs from "./components/Repairs";
import Analytics from "./components/Analytics";
import Notifications from "./components/Notifications";
import Technicians from "./components/Technicians";
import Navigation from "./components/Navigation";
import WaterPoints from "./components/WaterPoints";
import WaterPointsMap from "./components/WaterPointsMap";

import LoadingOverlay from "./components/LoadingOverlay";

import { useLoading } from "./components/LoadingContext";
import api from "./api/axios";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  const { loading, setLoading } = useLoading();

  // ==========================
  // GLOBAL AXIOS LOADER
  // ==========================
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        setLoading(true);
        return config;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    const resInterceptor = api.interceptors.response.use(
      (response) => {
        setLoading(false);
        return response;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [setLoading]);

  return (
    <>
      {!isLoginPage && <Navigation />}

      {loading && <LoadingOverlay />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-fault" element={<ReportFault />} />
        <Route path="/add-water-point" element={<AddWaterPoint />} />
        <Route path="/water-points" element={<WaterPoints />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/map" element={<WaterPointsMap />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;