import React from 'react'
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { AppLayout } from './components/Layout'
import Login from './pages/auth/Login'
import CustomerLoyalty from './pages/public/CustomerLoyalty'
import {
  FiGrid, FiUsers, FiMapPin, FiGift, FiStar, FiLink,
  FiUser, FiSettings, FiTrendingUp, FiCreditCard,
  FiFileText, FiSliders, MdQrCode2, MdStore
} from './components/icons'

// restaurant
import RDash from './pages/restaurant/Dashboard'
import RCustomers from './pages/restaurant/Customers'
import RVisits from './pages/restaurant/Visits'
import RRewards from './pages/restaurant/Rewards'
import RLoyalty from './pages/restaurant/LoyaltyProgram'
import RSocial from './pages/restaurant/SocialLinks'
import RQR from './pages/restaurant/QRCodePage'
import RStaff from './pages/restaurant/Staff'
import RSettings from './pages/restaurant/Settings'

// super
import SDash from './pages/superadmin/Dashboard'
import SRestaurants from './pages/superadmin/Restaurants'
import SCustomers from './pages/superadmin/GlobalCustomers'
import SAnalytics from './pages/superadmin/Analytics'
import SPlans from './pages/superadmin/Plans'
import SLogs from './pages/superadmin/ActivityLogs'
import SSettings from './pages/superadmin/PlatformSettings'

function RequireAuth({ roles, children }){
  const { session } = useAuth()
  if(!session) return <Navigate to="/login" replace />
  if(roles && !roles.includes(session.role)) return <Navigate to="/login" replace />
  return children
}

const rSidebar = [
  { path:'/app/dashboard', label:'Dashboard', icon:<FiGrid size={18} /> },
  { path:'/app/customers', label:'Customers', icon:<FiUsers size={18} /> },
  { path:'/app/visits', label:'Visits', icon:<FiMapPin size={18} /> },
  { path:'/app/rewards', label:'Rewards', icon:<FiGift size={18} /> },
  { path:'/app/loyalty', label:'Loyalty Program', icon:<FiStar size={18} /> },
  { path:'/app/social', label:'Social Links', icon:<FiLink size={18} /> },
  { path:'/app/qr', label:'QR Code', icon:<MdQrCode2 size={18} /> },
  { path:'/app/staff', label:'Staff', icon:<FiUser size={18} /> },
  { path:'/app/settings', label:'Settings', icon:<FiSettings size={18} /> },
]
const sSidebar = [
  { path:'/super/dashboard', label:'Dashboard', icon:<FiGrid size={18} /> },
  { path:'/super/restaurants', label:'Restaurants', icon:<MdStore size={18} /> },
  { path:'/super/customers', label:'Customers', icon:<FiUsers size={18} /> },
  { path:'/super/analytics', label:'Analytics', icon:<FiTrendingUp size={18} /> },
  { path:'/super/plans', label:'Plans & Subscriptions', icon:<FiCreditCard size={18} /> },
  { path:'/super/logs', label:'Activity Logs', icon:<FiFileText size={18} /> },
  { path:'/super/settings', label:'Platform Settings', icon:<FiSliders size={18} /> },
]

function RestaurantLayout(){
  return <AppLayout sidebar={rSidebar}><Outlet/></AppLayout>
}
function SuperLayout(){
  return <AppLayout sidebar={sSidebar}><Outlet/></AppLayout>
}

export default function App(){
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/r/:restaurantId" element={<CustomerLoyalty/>} />
            <Route path="/app" element={<RequireAuth roles={['restaurant_admin','staff']}><RestaurantLayout/></RequireAuth>}>
              <Route path="dashboard" element={<RDash/>} />
              <Route path="customers" element={<RCustomers/>} />
              <Route path="visits" element={<RVisits/>} />
              <Route path="rewards" element={<RRewards/>} />
              <Route path="loyalty" element={<RLoyalty/>} />
              <Route path="social" element={<RSocial/>} />
              <Route path="qr" element={<RQR/>} />
              <Route path="staff" element={<RStaff/>} />
              <Route path="settings" element={<RSettings/>} />
              <Route index element={<Navigate to="dashboard" replace/>} />
            </Route>
            <Route path="/super" element={<RequireAuth roles={['superadmin']}><SuperLayout/></RequireAuth>}>
              <Route path="dashboard" element={<SDash/>} />
              <Route path="restaurants" element={<SRestaurants/>} />
              <Route path="customers" element={<SCustomers/>} />
              <Route path="analytics" element={<SAnalytics/>} />
              <Route path="plans" element={<SPlans/>} />
              <Route path="logs" element={<SLogs/>} />
              <Route path="settings" element={<SSettings/>} />
              <Route index element={<Navigate to="dashboard" replace/>} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace/>} />
            <Route path="*" element={<div style={{padding:40}}>Not found — <a href="#/login">Go login</a></div>} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  )
}
