import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import RegisterOffice from './pages/RegisterOffice';
import GenerateAccess from './pages/GenerateAccess';

import OfficePortalLayout from './layouts/OfficePortalLayout';
import PortalLogin from './pages/PortalLogin';
import PortalDashboard from './pages/PortalDashboard';
import ClientManager from './pages/ClientManager';
import ClientDashboard from './pages/ClientDashboard';
import ClientOverview from './pages/ClientOverview';
import ClientEmployees from './pages/ClientEmployees';
import EmployeeDetails from './pages/EmployeeDetails';
import ClientInvoices from './pages/ClientInvoices';
import TaskManager from './pages/TaskManager';
import BillingManager from './pages/BillingManager';
import ClientSettings from './pages/ClientSettings';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="register-office" element={<RegisterOffice />} />
          <Route path="generate-access" element={<GenerateAccess />} />

        </Route>

        {/* Office Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal" element={<OfficePortalLayout />}>
          <Route index element={<PortalDashboard />} />
          <Route path="clients" element={<ClientManager />} />
          <Route path="client/:clientId" element={<ClientDashboard />}>
            <Route index element={<ClientOverview />} />
            <Route path="employees" element={<ClientEmployees />} />
            <Route path="employee/:employeeId" element={<EmployeeDetails />} />
            <Route path="invoices" element={<ClientInvoices />} />
            {/* Reusing these for now, or create specific scoped ones later */}
            <Route path="tasks" element={<div style={{ padding: '2rem' }}>Gestão de Tarefas Em Breve</div>} />
            <Route path="billings" element={<div style={{ padding: '2rem' }}>Gestão de Faturas Em Breve</div>} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>
          <Route path="tasks" element={<TaskManager />} />
          <Route path="billings" element={<BillingManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
