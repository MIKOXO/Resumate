import axios from 'axios'

const api = axios.create({
  baseURL: '/api/team-members',
  withCredentials: true,
})

const teamMemberService = {
  list: () => api.get('/'),
  create: (name) => api.post('/', { name }),
  remove: (teamMemberId) => api.delete(`/${teamMemberId}`),
}

export default teamMemberService
