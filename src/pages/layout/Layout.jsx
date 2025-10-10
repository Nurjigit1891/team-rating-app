import React from 'react'
import { Route, Routes } from 'react-router-dom'
import App from '../../App'
import AdminDashboard from '../adminDashboard/AdminDashboard'
import FriendRatingApp from '../friendRating/FriendRatingApp'
import AdminDashboardFriends from '../adminDashboardFriends/AdminDashboardFriends'
import PlayerCardsView from '../playerCardsView/PlayerCardsView'

const Layout = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<App />}/>
        <Route path='/friends' elem  ent={<FriendRatingApp />} />
        <Route path='/admin123' element={<AdminDashboard />}/>
        <Route path='/admin-friends' element={<AdminDashboardFriends />} />
        <Route path='/cards' element={<PlayerCardsView />}/>

      </Routes>
    </div>
  )
}

export default Layout
