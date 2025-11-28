import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CampusMap from './pages/CampusMap';
// import Login from './pages/Login';
// import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/map" element={<CampusMap />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
    </Router>
  );
}


