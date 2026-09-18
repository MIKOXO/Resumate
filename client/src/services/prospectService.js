import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || '/api'}/prospects`,
  withCredentials: true,
})

const prospectService = {
  list: () => api.get('/'),
  upload: (name, file) => {
    const form = new FormData()
    form.append('name', name)
    form.append('file', file)
    return api.post('/', form)
  },
  replace: (prospectId, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.put(`/${prospectId}`, form)
  },
  remove: (prospectId) => api.delete(`/${prospectId}`),
}

export default prospectService