import useEcoStore from '../store/ecoStore'

function ScoreCard() {
  const { stats, loading } = useEcoStore()

  if (loading) return <p>Loading...</p>

  const isBelow = stats.user_score < stats.community_average

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'left',
      background: 'var(--ec-card)',
      border: '1px solid var(--ec-sage)',
    }}>
      <h2 style={{ color: 'var(--ec-bg)' }}>Your Carbon Score</h2>
      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ec-accent)' }}>
        {stats.user_score} <span style={{ fontSize: '1rem', color: 'var(--ec-green)' }}>kg CO2</span>
      </p>
      <p style={{ color: 'var(--ec-green)', margin: '0.5rem 0' }}>
        Community average: <strong>{stats.community_average} kg CO2</strong>
      </p>
      <p style={{
        marginTop: '0.75rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '4px',
        background: 'rgba(232, 115, 44, 0.12)',
        border: '1px solid var(--ec-accent)',
        color: 'var(--ec-bg)',
      }}>
        {isBelow ? 'Below community average' : 'Above community average'}
      </p>
    </div>
  )
}

export default ScoreCard