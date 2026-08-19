import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || '/api'}/generate`,
  withCredentials: true,
})

/**
 * @param {{ teamMemberId: string, prospectId: string, jobDescription: string, companyName: string, date: string }} params
 */
const generate = (params) =>
  api.post('/', params, { responseType: 'blob' })

export default { generate }
