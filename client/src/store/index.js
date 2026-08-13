import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import teamMembersReducer from './slices/teamMembersSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    teamMembers: teamMembersReducer,
  },
})

export default store
