import { useState, useEffect } from 'react'
import { getAppointments, deleteAppointment } from '../api'
import AppointmentList from '../components/AppointmentList'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])

  const load = () => getAppointments().then(setAppointments)
  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler ce rendez-vous ?')) return
    try {
      await deleteAppointment(id)
      load()
    } catch {
      alert("Erreur lors de l'annulation.")
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Mes Rendez-vous</h2>
      <AppointmentList appointments={appointments} onCancel={handleCancel} />
    </div>
  )
}
