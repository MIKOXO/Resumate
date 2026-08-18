import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import generateService from '@/services/generateService'
import { logout } from '@/store/slices/authSlice'

export const generateResume = createAsyncThunk(
  'generation/generate',
  async (params, { rejectWithValue }) => {
    try {
      const res = await generateService.generate(params)
      const disposition = res.headers['content-disposition'] || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match ? match[1] : 'resume.pdf'
      return { prospectId: params.prospectId, blob: res.data, filename }
    } catch (err) {
      // With responseType:'blob', error body is also a blob — parse it for the message
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          return rejectWithValue(json.error || 'Generation failed.')
        } catch {
          // fall through
        }
      }
      return rejectWithValue(err.response?.data?.error || 'Generation failed.')
    }
  },
)

const generationSlice = createSlice({
  name: 'generation',
  initialState: {
    status: 'idle', // 'idle' | 'generating' | 'success' | 'error'
    error: null,
    operatingProspectId: null,
    results: {}, // prospectId -> { blob, filename }
  },
  reducers: {
    clearProspectResult: (state, action) => {
      delete state.results[action.payload]
      if (state.operatingProspectId === action.payload) {
        state.status = 'idle'
        state.error = null
      }
    },
    clearGenerationState: (state) => {
      state.status = 'idle'
      state.error = null
      state.operatingProspectId = null
      state.results = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateResume.pending, (state, action) => {
        state.status = 'generating'
        state.error = null
        state.operatingProspectId = action.meta.arg.prospectId
      })
      .addCase(generateResume.fulfilled, (state, action) => {
        const { prospectId, blob, filename } = action.payload
        state.results[prospectId] = { blob, filename }
        if (state.operatingProspectId === prospectId) {
          state.status = 'success'
        }
      })
      .addCase(generateResume.rejected, (state, action) => {
        if (state.operatingProspectId === action.meta.arg.prospectId) {
          state.status = 'error'
          state.error = action.payload
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle'
        state.error = null
        state.operatingProspectId = null
        state.results = {}
      })
  },
})

export const { clearProspectResult, clearGenerationState } = generationSlice.actions
export default generationSlice.reducer
