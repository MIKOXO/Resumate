import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import teamMemberService from '@/services/teamMemberService'
import prospectService from '@/services/prospectService'
import { logout } from '@/store/slices/authSlice'

const withProspectState = (teamMember) => ({
  ...teamMember,
  prospects: [],
  prospectsLoaded: false,
  prospectsLoading: false,
  expanded: false,
})

const findMember = (state, teamMemberId) => state.list.find((tm) => tm._id === teamMemberId)

export const fetchTeamMembers = createAsyncThunk('teamMembers/fetchTeamMembers', async (_, { rejectWithValue }) => {
  try {
    const res = await teamMemberService.list()
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load team members.')
  }
})

export const createTeamMember = createAsyncThunk('teamMembers/createTeamMember', async (name, { rejectWithValue }) => {
  try {
    const res = await teamMemberService.create(name)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add team member.')
  }
})

export const deleteTeamMember = createAsyncThunk('teamMembers/deleteTeamMember', async (teamMemberId, { rejectWithValue }) => {
  try {
    await teamMemberService.remove(teamMemberId)
    return teamMemberId
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete team member.')
  }
})

export const fetchProspectsForTeamMember = createAsyncThunk('teamMembers/fetchProspectsForTeamMember', async (teamMemberId, { rejectWithValue }) => {
  try {
    const res = await prospectService.list(teamMemberId)
    return { teamMemberId, prospects: res.data.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load prospects.')
  }
})

export const uploadProspect = createAsyncThunk('teamMembers/uploadProspect', async ({ teamMemberId, name, file }, { rejectWithValue }) => {
  try {
    const res = await prospectService.upload(teamMemberId, name, file)
    return { teamMemberId, prospect: res.data.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to upload prospect.')
  }
})

export const replaceProspectResume = createAsyncThunk('teamMembers/replaceProspectResume', async ({ teamMemberId, prospectId, file }, { rejectWithValue }) => {
  try {
    const res = await prospectService.replace(teamMemberId, prospectId, file)
    return { teamMemberId, prospect: res.data.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to replace resume.')
  }
})

export const deleteProspect = createAsyncThunk('teamMembers/deleteProspect', async ({ teamMemberId, prospectId }, { rejectWithValue }) => {
  try {
    await prospectService.remove(teamMemberId, prospectId)
    return { teamMemberId, prospectId }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete prospect.')
  }
})

export const toggleExpand = (teamMemberId) => (dispatch, getState) => {
  const member = findMember(getState().teamMembers, teamMemberId)
  const expanding = !member?.expanded
  dispatch(setExpanded(teamMemberId))
  if (expanding && member && !member.prospectsLoaded && !member.prospectsLoading) {
    dispatch(fetchProspectsForTeamMember(teamMemberId))
  }
}

const teamMembersSlice = createSlice({
  name: 'teamMembers',
  initialState: {
    list: [],
    selectedProspectId: null,
    selectedTeamMemberId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setExpanded: (state, action) => {
      const member = findMember(state, action.payload)
      if (member) member.expanded = !member.expanded
    },
    selectProspect: (state, action) => {
      state.selectedProspectId = action.payload.prospectId
      state.selectedTeamMemberId = action.payload.teamMemberId
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.map(withProspectState)
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(createTeamMember.pending, (state) => { state.error = null })
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.list.push(withProspectState(action.payload))
      })
      .addCase(createTeamMember.rejected, (state, action) => { state.error = action.payload })

      .addCase(deleteTeamMember.pending, (state) => { state.error = null })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        const member = findMember(state, action.payload)
        if (member?.prospects?.some((p) => p._id === state.selectedProspectId)) {
          state.selectedProspectId = null
          state.selectedTeamMemberId = null
        }
        state.list = state.list.filter((tm) => tm._id !== action.payload)
      })
      .addCase(deleteTeamMember.rejected, (state, action) => { state.error = action.payload })

      .addCase(fetchProspectsForTeamMember.pending, (state, action) => {
        const member = findMember(state, action.meta.arg)
        if (member) member.prospectsLoading = true
      })
      .addCase(fetchProspectsForTeamMember.fulfilled, (state, action) => {
        const member = findMember(state, action.payload.teamMemberId)
        if (member) {
          member.prospects = action.payload.prospects
          member.prospectsLoaded = true
          member.prospectsLoading = false
        }
      })
      .addCase(fetchProspectsForTeamMember.rejected, (state, action) => {
        const member = findMember(state, action.meta.arg)
        if (member) member.prospectsLoading = false
        state.error = action.payload
      })

      .addCase(uploadProspect.pending, (state) => { state.error = null })
      .addCase(uploadProspect.fulfilled, (state, action) => {
        const member = findMember(state, action.payload.teamMemberId)
        if (member) {
          member.prospects.push(action.payload.prospect)
          member.prospectsLoaded = true
        }
      })
      .addCase(uploadProspect.rejected, (state, action) => { state.error = action.payload })

      .addCase(replaceProspectResume.pending, (state) => { state.error = null })
      .addCase(replaceProspectResume.fulfilled, (state, action) => {
        const member = findMember(state, action.payload.teamMemberId)
        if (member) {
          const idx = member.prospects.findIndex((p) => p._id === action.payload.prospect._id)
          if (idx !== -1) member.prospects[idx] = action.payload.prospect
        }
      })
      .addCase(replaceProspectResume.rejected, (state, action) => { state.error = action.payload })

      .addCase(deleteProspect.pending, (state) => { state.error = null })
      .addCase(deleteProspect.fulfilled, (state, action) => {
        const member = findMember(state, action.payload.teamMemberId)
        if (member) {
          member.prospects = member.prospects.filter((p) => p._id !== action.payload.prospectId)
        }
        if (state.selectedProspectId === action.payload.prospectId) {
          state.selectedProspectId = null
          state.selectedTeamMemberId = null
        }
      })
      .addCase(deleteProspect.rejected, (state, action) => { state.error = action.payload })

      .addCase(logout.fulfilled, (state) => {
        state.list = []
        state.selectedProspectId = null
        state.selectedTeamMemberId = null
        state.error = null
      })
  },
})

export const { setExpanded, selectProspect, clearError } = teamMembersSlice.actions
export default teamMembersSlice.reducer
