import React from 'react'
import { Route, Routes } from 'react-router-dom'
import App from '../../App'
import AdminDashboard from '../adminDashboard/AdminDashboard'

const Layout = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<App />}/>
        <Route path='/admin123' element={<AdminDashboard />}/>
      </Routes>
    </div>
  )
}

export default Layout
