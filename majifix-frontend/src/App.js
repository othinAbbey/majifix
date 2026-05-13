import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ReportFault from './components/ReportFault';
import Assignments from './components/Assignments';
import Repairs from './components/Repairs';
import Analytics from './components/Analytics';
import Notifications from './components/Notifications';
import Navigation from './components/Navigation';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isLoginPage && <Navigation />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-fault" element={<ReportFault />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
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
