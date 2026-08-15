import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import teamMembersReducer from './slices/teamMembersSlice'
import generationReducer from './slices/generationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    teamMembers: teamMembersReducer,
    generation: generationReducer,
  },
})

export default store
