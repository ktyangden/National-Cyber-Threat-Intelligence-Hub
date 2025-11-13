import './App.css'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { SimpleHeader } from "./components/Navbar.tsx";
import Home from "./pages/Home.tsx"
import Footer from "./components/Footer.tsx";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen dark:bg-black">
        <SimpleHeader />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
          </Routes>
          <Footer />
        </div>
    </Router>
  )
}

