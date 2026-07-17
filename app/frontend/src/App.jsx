import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import MyAppointments from './pages/MyAppointments'

export default function App() {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>MediBook</h1>
        <div style={styles.links}>
          <NavLink to="/" style={styles.link}>Accueil</NavLink>
          <NavLink to="/mes-rendez-vous" style={styles.link}>Mes Rendez-vous</NavLink>
        </div>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mes-rendez-vous" element={<MyAppointments />} />
        </Routes>
      </main>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#1a73e8',
    color: '#fff',
  },
  logo: { fontSize: 24, fontWeight: 700, margin: 0 },
  links: { display: 'flex', gap: 24 },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 16,
  },
  main: { padding: '32px 40px' },
}
