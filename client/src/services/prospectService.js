import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || '/api'}/team-members`,
  withCredentials: true,
})

const prospectService = {
  list: (teamMemberId) => api.get(`/${teamMemberId}/prospects`),
  upload: (teamMemberId, name, file) => {
    const form = new FormData()
    form.append('name', name)
    form.append('file', file)
    return api.post(`/${teamMemberId}/prospects`, form)
  },
  replace: (teamMemberId, prospectId, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.put(`/${teamMemberId}/prospects/${prospectId}`, form)
  },
  remove: (teamMemberId, prospectId) => api.delete(`/${teamMemberId}/prospects/${prospectId}`),
}

export default prospectService
