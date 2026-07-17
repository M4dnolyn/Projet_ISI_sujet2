import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const getDoctors = (specialty) =>
  api.get('/doctors', { params: specialty ? { specialty } : {} }).then(r => r.data)

export const getAppointments = () =>
  api.get('/appointments').then(r => r.data)

export const createAppointment = (data) =>
  api.post('/appointments', data).then(r => r.data)

export const deleteAppointment = (id) =>
  api.delete(`/appointments/${id}`).then(r => r.data)
