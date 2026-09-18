import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import prospectService from '@/services/prospectService'
import { logout } from '@/store/slices/authSlice'

export const fetchProspects = createAsyncThunk('prospects/fetchProspects', async (_, { rejectWithValue }) => {
  try {
    const res = await prospectService.list()
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load prospects.')
  }
})

export const uploadProspect = createAsyncThunk('prospects/uploadProspect', async ({ name, file }, { rejectWithValue }) => {
  try {
    const res = await prospectService.upload(name, file)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to upload prospect.')
  }
})

export const replaceProspectResume = createAsyncThunk('prospects/replaceProspectResume', async ({ prospectId, file }, { rejectWithValue }) => {
  try {
    const res = await prospectService.replace(prospectId, file)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to replace resume.')
  }
})

export const deleteProspect = createAsyncThunk('prospects/deleteProspect', async (prospectId, { rejectWithValue }) => {
  try {
    await prospectService.remove(prospectId)
    return prospectId
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete prospect.')
  }
})

const prospectsSlice = createSlice({
  name: 'prospects',
  initialState: {
    list: [],
    selectedProspectId: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectProspect: (state, action) => {
      state.selectedProspectId = action.payload
    },
    clearSelectedProspect: (state) => {
      state.selectedProspectId = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProspects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProspects.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchProspects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(uploadProspect.pending, (state) => { state.error = null })
      .addCase(uploadProspect.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(uploadProspect.rejected, (state, action) => { state.error = action.payload })

      .addCase(replaceProspectResume.pending, (state) => { state.error = null })
      .addCase(replaceProspectResume.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload._id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(replaceProspectResume.rejected, (state, action) => { state.error = action.payload })

      .addCase(deleteProspect.pending, (state) => { state.error = null })
      .addCase(deleteProspect.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload)
        if (state.selectedProspectId === action.payload) {
          state.selectedProspectId = null
        }
      })
      .addCase(deleteProspect.rejected, (state, action) => { state.error = action.payload })

      .addCase(logout.fulfilled, (state) => {
        state.list = []
        state.selectedProspectId = null
        state.error = null
      })
  },
})

export const { selectProspect, clearSelectedProspect, clearError } = prospectsSlice.actions
export default prospectsSlice.reducer