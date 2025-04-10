import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import WarehouseManagement from './pages/WarehouseManagement';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/warehouse" element={<WarehouseManagement />} />
          <Route path="/charts" element={<Dashboard />} />
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;