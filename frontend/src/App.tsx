import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CampusMap from './pages/CampusMap';
import Modify from './pages/Modify';
import Login from './pages/Login';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path ="/" element={<CampusMap />} />
        <Route path="/map" element={<CampusMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/modify" element={<Modify />} />
      </Routes>
    </Router>
  );
}


