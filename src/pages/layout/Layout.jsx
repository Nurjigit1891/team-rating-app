import React from 'react'
import { Route, Routes } from 'react-router-dom'
import App from '../../App'
import AdminDashboard from '../adminDashboard/AdminDashboard'
import FriendRatingApp from '../friendRating/FriendRatingApp'

const Layout = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<App />}/>
        <Route path='friends' element={<FriendRatingApp />} />
        <Route path='/admin123' element={<AdminDashboard />}/>
      </Routes>
    </div>
  )
}

export default Layout
