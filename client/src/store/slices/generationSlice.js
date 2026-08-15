import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import generateService from '@/services/generateService'

export const generateResume = createAsyncThunk(
  'generation/generate',
  async (params, { rejectWithValue }) => {
    try {
      const res = await generateService.generate(params)
      const disposition = res.headers['content-disposition'] || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match ? match[1] : 'resume.pdf'
      return { blob: res.data, filename }
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
    resultBlob: null,
    resultFilename: null,
  },
  reducers: {
    resetGeneration: (state) => {
      state.status = 'idle'
      state.error = null
      state.resultBlob = null
      state.resultFilename = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateResume.pending, (state) => {
        state.status = 'generating'
        state.error = null
        state.resultBlob = null
        state.resultFilename = null
      })
      .addCase(generateResume.fulfilled, (state, action) => {
        state.status = 'success'
        state.resultBlob = action.payload.blob
        state.resultFilename = action.payload.filename
      })
      .addCase(generateResume.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload
      })
  },
})

export const { resetGeneration } = generationSlice.actions
export default generationSlice.reducer
