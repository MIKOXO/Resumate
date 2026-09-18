import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import prospectsReducer from './slices/prospectsSlice'
import generationReducer from './slices/generationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    prospects: prospectsReducer,
    generation: generationReducer,
  },
})

export default store