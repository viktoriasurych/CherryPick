import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Головна сторінка ("/") тепер показує AuthPage */}
        <Route path="/" element={<AuthPage />} />
        
        {/* Будь-яка інша адреса перекидає на головну */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;