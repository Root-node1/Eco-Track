import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import useEcoStore from '../store/ecoStore'

function BreakdownChart() {
  const { stats, loading } = useEcoStore()

  if (loading) return <p>Loading...</p>

  const data = [
    { name: 'Transport', value: stats.breakdown.transport },
    { name: 'Electricity', value: stats.breakdown.electricity },
    { name: 'Food', value: stats.breakdown.food },
  ]

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '8px',
      textAlign: 'left',
      background: 'var(--ec-card)',
      border: '1px solid var(--ec-sage)',
    }}>
      <h2 style={{ color: 'var(--ec-bg)' }}>Carbon Breakdown</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: 'var(--ec-bg)' }} />
          <YAxis tick={{ fill: 'var(--ec-bg)' }} unit=" kg" />
          <Tooltip
            contentStyle={{
              background: 'var(--ec-card)',
              border: '1px solid var(--ec-sage)',
              color: 'var(--ec-bg)',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={index === 0 ? 'var(--ec-accent)' : 'var(--ec-green)'} opacity={1 - index * 0.15} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BreakdownChart