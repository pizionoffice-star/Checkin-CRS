import React from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card, StatCard } from '../../components/Layout'
import { FiUsers, FiMapPin, FiGift, FiStar } from '../../components/icons'

export default function Dashboard(){
  const { data } = useData()
  const { session } = useAuth()
  const rid = session.restaurantId
  const customers = data.customers.filter(c=> c.restaurantId===rid)
  const visits = data.visits.filter(v=> v.restaurantId===rid)
  const redemptions = data.redemptions.filter(r=> r.restaurantId===rid)
  const pointsIssued = data.pointTransactions.filter(t=> t.restaurantId===rid && t.points>0).reduce((s,t)=> s+t.points,0)
  const today = new Date().toISOString().slice(0,10)
  const todaysVisits = visits.filter(v=> v.date===today).length
  const returning = customers.filter(c=> c.totalVisits>1).length

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="stat-grid">
        <StatCard label="Total Customers" value={customers.length} icon={<FiUsers size={20} />} sub={`${returning} returning`} />
        <StatCard label="Today's Visits" value={todaysVisits} icon={<FiMapPin size={20} />} />
        <StatCard label="Rewards Redeemed" value={redemptions.length} icon={<FiGift size={20} />} />
        <StatCard label="Points Issued" value={pointsIssued} icon={<FiStar size={20} />} />
      </div>
      <div className="grid-2">
        <Card>
          <h3>Recent Visits</h3>
          <table className="table">
            <thead><tr><th>Customer</th><th>Date</th><th>Points</th></tr></thead>
            <tbody>
              {visits.slice(0,5).map(v=>{
                const c = data.customers.find(x=> x.id===v.customerId)
                return <tr key={v.id}><td>{c?.name||'—'} <small className="muted">{c?.phone}</small></td><td>{v.date} {v.time}</td><td>+{v.pointsEarned}</td></tr>
              })}
              {visits.length===0 && <tr><td colSpan={3} className="muted">No visits yet</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card>
          <h3>Recent Redemptions</h3>
          <table className="table">
            <thead><tr><th>Customer</th><th>Reward</th><th>Date</th></tr></thead>
            <tbody>
              {redemptions.slice(0,5).map(r=>{
                const c = data.customers.find(x=> x.id===r.customerId)
                const rw = data.rewards.find(x=> x.id===r.rewardId)
                return <tr key={r.id}><td>{c?.name}</td><td>{rw?.name}</td><td>{new Date(r.date).toLocaleDateString()}</td></tr>
              })}
              {redemptions.length===0 && <tr><td colSpan={3} className="muted">No redemptions</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
