import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import EmployeesDashboard from '../pages/EmployeesDashboard';
import AttendanceDashboard  from '../pages/AttendanceDashboard';  
import WorksCheduleDashboard  from '../pages/WorksCheduleDashboard'; 
import CheckInPage  from '../pages/CheckInPage'; 

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/employees" element={<EmployeesDashboard />} />
        <Route path="/dashboard/attendace" element={<AttendanceDashboard />} />
        <Route path="/dashboard/workschedule" element={<WorksCheduleDashboard />} />
        <Route path="/checkin" element={<CheckInPage />} />
      </Routes>
    </Router>
  );
}
