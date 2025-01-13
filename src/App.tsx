import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import ConnectTwitter from './pages/ConnectTwitter';
import Logs from './pages/Logs';
import CreateToken from './pages/CreateToken';


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateAgent />} />
          <Route path="/edit/:id" element={<CreateAgent />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/connect-twitter" element={<ConnectTwitter />} />
          <Route path="/create-token" element={<CreateToken />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;