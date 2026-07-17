import { useState, useEffect } from 'react'
import { getDoctors } from '../api'
import DoctorCard from '../components/DoctorCard'
import AppointmentForm from '../components/AppointmentForm'

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [specialty, setSpecialty] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  const loadDoctors = () =>
    getDoctors(specialty).then(setDoctors)

  useEffect(() => { loadDoctors() }, [specialty])

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nos médecins</h2>
      <select
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        style={styles.filter}
      >
        <option value="">Toutes les spécialités</option>
        <option value="généraliste">Généraliste</option>
        <option value="cardiologue">Cardiologue</option>
        <option value="pédiatre">Pédiatre</option>
        <option value="dermatologue">Dermatologue</option>
        <option value="ophtalmologue">Ophtalmologue</option>
        <option value="gynécologue">Gynécologue</option>
      </select>

      <div style={{ marginTop: 20 }}>
        {doctors.map(d => (
          <DoctorCard key={d.id} doctor={d} onSelect={setSelectedDoctor} />
        ))}
      </div>

      {selectedDoctor && (
        <AppointmentForm
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onCreated={() => alert('Rendez-vous créé avec succès !')}
        />
      )}
    </div>
  )
}

const styles = {
  filter: {
    padding: '8px 12px',
    fontSize: 15,
    borderRadius: 6,
    border: '1px solid #ccc',
  },
}
