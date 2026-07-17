import StatusBadge from './StatusBadge'

export default function AppointmentList({ appointments, onCancel }) {
  if (!appointments.length)
    return <p style={{ color: '#888' }}>Aucun rendez-vous pour le moment.</p>

  return (
    <div>
      {appointments.map(a => (
        <div key={a.id} style={styles.card}>
          <div style={styles.info}>
            <strong>{a.patient_name}</strong>
            <p style={styles.detail}>
              {a.date} — {a.time_slot} · {a.doctor_name}
            </p>
            {a.reason && <p style={styles.reason}>{a.reason}</p>}
          </div>
          <div style={styles.right}>
            <StatusBadge status={a.status} />
            {a.status === 'pending' && (
              <button style={styles.btn} onClick={() => onCancel(a.id)}>
                Annuler
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: 10,
  },
  info: { flex: 1 },
  detail: { margin: '4px 0', color: '#555', fontSize: 14 },
  reason: { color: '#777', fontSize: 13, fontStyle: 'italic', margin: 0 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  btn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
  },
}
