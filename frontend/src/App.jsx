import { useState } from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx'
import Booking from './components/Booking.jsx';
function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/booking' element={<Booking/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App
