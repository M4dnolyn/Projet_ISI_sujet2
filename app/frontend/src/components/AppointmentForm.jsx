import { useState } from 'react'
import { createAppointment } from '../api'

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

export default function AppointmentForm({ doctor, onClose, onCreated }) {
  const [form, setForm] = useState({
    patient_name: '',
    date: '',
    time_slot: '',
    reason: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createAppointment({ ...form, doctor_id: doctor.id })
      onCreated()
      onClose()
    } catch {
      setError("Erreur lors de la création du rendez-vous.")
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Prendre RDV avec {doctor.name}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="patient_name" placeholder="Votre nom" required
            value={form.patient_name} onChange={handleChange}
            style={styles.input}
          />
          <input
            name="date" type="date" required
            value={form.date} onChange={handleChange}
            style={styles.input}
          />
          <select
            name="time_slot" required
            value={form.time_slot} onChange={handleChange}
            style={styles.input}
          >
            <option value="">Choisir un créneau</option>
            {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea
            name="reason" placeholder="Motif de la consultation"
            value={form.reason} onChange={handleChange}
            style={{ ...styles.input, minHeight: 80 }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.btnCancel}>Annuler</button>
            <button type="submit" style={styles.btnSubmit}>Confirmer le RDV</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 12, padding: 32,
    width: 420, maxWidth: '90vw',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc',
    fontFamily: 'inherit',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  btnCancel: {
    padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc',
    backgroundColor: '#fff', cursor: 'pointer',
  },
  btnSubmit: {
    padding: '8px 20px', borderRadius: 6, border: 'none',
    backgroundColor: '#1a73e8', color: '#fff', fontWeight: 600, cursor: 'pointer',
  },
}
