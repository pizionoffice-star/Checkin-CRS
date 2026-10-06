import React from 'react'
import { useData } from '../../contexts/DataContext'
import { Card, StatCard } from '../../components/Layout'
import { FiRepeat, FiStar, FiGift, FiAward } from '../../components/icons'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Analytics(){
  const { data } = useData()
  const months = ['2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09']
  const restaurantGrowth = months.map(m=> ({ month:m.slice(5), restaurants: data.restaurants.filter(r=> r.createdAt.slice(0,7) <= m).length }))
  const customerGrowth = months.map(m=> ({ month:m.slice(5), customers: data.customers.filter(c=> c.createdAt.slice(0,7) <= m).length }))
  const visitsByMonth = months.map(m=> ({ month:m.slice(5), visits: data.visits.filter(v=> v.date.slice(0,7)===m).length }))
  const returning = data.customers.filter(c=> c.totalVisits>1).length
  const pointsIssued = data.pointTransactions.filter(t=> t.points>0).reduce((s,t)=> s+t.points,0)
  const pointsRedeemed = Math.abs(data.pointTransactions.filter(t=> t.points<0).reduce((s,t)=> s+t.points,0))
  return (
    <div>
      <h2 className="page-title">Analytics</h2>
      <div className="stat-grid">
        <StatCard label="Returning Customers" value={returning} icon={<FiRepeat size={20} />} />
        <StatCard label="Points Issued" value={pointsIssued} icon={<FiStar size={20} />} />
        <StatCard label="Points Redeemed" value={pointsRedeemed} icon={<FiGift size={20} />} />
        <StatCard label="Total Rewards Redeemed" value={data.redemptions.length} icon={<FiAward size={20} />} />
      </div>
      <div className="grid-2">
        <Card>
          <h3>Restaurant Growth</h3>
          <div style={{height:200}}><ResponsiveContainer width="100%" height="100%"><LineChart data={restaurantGrowth}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line type="monotone" dataKey="restaurants" stroke="#000" strokeWidth={2}/></LineChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3>Customer Growth</h3>
          <div style={{height:200}}><ResponsiveContainer width="100%" height="100%"><LineChart data={customerGrowth}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line type="monotone" dataKey="customers" stroke="#80F800" strokeWidth={2}/></LineChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3>Visits per Month</h3>
          <div style={{height:200}}><ResponsiveContainer width="100%" height="100%"><BarChart data={visitsByMonth}><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="visits" fill="#000"/></BarChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3>Platform Totals</h3>
          <table className="table"><tbody>
            <tr><td>Total Visits</td><td><b>{data.visits.length}</b></td></tr>
            <tr><td>Returning</td><td><b>{returning}</b></td></tr>
            <tr><td>Points Issued</td><td><b>{pointsIssued}</b></td></tr>
            <tr><td>Points Redeemed</td><td><b>{pointsRedeemed}</b></td></tr>
          </tbody></table>
        </Card>
      </div>
    </div>
  )
}
