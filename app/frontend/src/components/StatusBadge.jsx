const colors = {
  pending: { bg: '#fff3cd', color: '#856404' },
  confirmed: { bg: '#d4edda', color: '#155724' },
  cancelled: { bg: '#f8d7da', color: '#721c24' },
}

export default function StatusBadge({ status }) {
  const s = colors[status] || colors.pending
  return (
    <span style={{ ...styles.badge, backgroundColor: s.bg, color: s.color }}>
      {status === 'pending' ? 'En attente' : status === 'confirmed' ? 'Confirmé' : 'Annulé'}
    </span>
  )
}

const styles = {
  badge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
}
