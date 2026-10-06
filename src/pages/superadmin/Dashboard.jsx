import React from 'react'
import { useData } from '../../contexts/DataContext'
import { Card, StatCard } from '../../components/Layout'
import { FiUsers, FiMapPin, FiGift, FiStar, FiCheckCircle, MdStore } from '../../components/icons'
import { RestaurantLogo } from '../../utils/logo'

export default function SuperDashboard(){
  const { data } = useData()
  const totalRestaurants = data.restaurants.length
  const active = data.restaurants.filter(r=> r.status==='Active').length
  const totalCustomers = data.customers.length
  const totalVisits = data.visits.length
  const totalPoints = data.pointTransactions.filter(t=> t.points>0).reduce((s,t)=> s+t.points,0)
  const totalRedeemed = data.redemptions.length

  return (
    <div>
      <h2 className="page-title">Platform Dashboard</h2>
      <div className="stat-grid">
        <StatCard label="Total Restaurants" value={totalRestaurants} icon={<MdStore size={20} />} sub={`${active} active`} />
        <StatCard label="Total Customers" value={totalCustomers} icon={<FiUsers size={20} />} />
        <StatCard label="Total Visits" value={totalVisits} icon={<FiMapPin size={20} />} />
        <StatCard label="Points Issued" value={totalPoints} icon={<FiStar size={20} />} />
        <StatCard label="Rewards Redeemed" value={totalRedeemed} icon={<FiGift size={20} />} />
        <StatCard label="Active Restaurants" value={active} icon={<FiCheckCircle size={20} />} />
      </div>
      <div className="grid-2">
        <Card>
          <h3>New Restaurants</h3>
          <table className="table"><thead><tr><th>Name</th><th>Plan</th><th>Status</th></tr></thead><tbody>
            {data.restaurants.slice(0,5).map(r=> <tr key={r.id}><td style={{display:'flex', gap:6, alignItems:'center'}}><RestaurantLogo logo={r.logo} size={22} /> {r.name}</td><td>{r.plan}</td><td>{r.status}</td></tr>)}
          </tbody></table>
        </Card>
        <Card>
          <h3>Recent Customers</h3>
          <table className="table"><thead><tr><th>Customer</th><th>Restaurant</th><th>Date</th></tr></thead><tbody>
            {data.customers.slice(0,5).map(c=>{
              const r=data.restaurants.find(x=> x.id===c.restaurantId)
              return <tr key={c.id}><td>{c.name}</td><td>{r?.name}</td><td>{new Date(c.createdAt).toLocaleDateString()}</td></tr>
            })}
          </tbody></table>
        </Card>
      </div>
    </div>
  )
}
