export default function DoctorCard({ doctor, onSelect }) {
  return (
    <div style={styles.card}>
      <img src={doctor.avatar_url} alt={doctor.name} style={styles.avatar} />
      <div>
        <h3 style={styles.name}>{doctor.name}</h3>
        <p style={styles.specialty}>{doctor.specialty}</p>
      </div>
      <button style={styles.btn} onClick={() => onSelect(doctor)}>
        Prendre RDV
      </button>
    </div>
  )
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: '50%', background: '#e0e7ff' },
  name: { margin: 0, fontSize: 18, fontWeight: 600 },
  specialty: { margin: '4px 0 0', color: '#555', fontSize: 14 },
  btn: {
    marginLeft: 'auto',
    padding: '8px 18px',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
