import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import store from './store/index.js'
import { fetchCurrentUser } from './store/slices/authSlice.js'
import App from './App.jsx'

store.dispatch(fetchCurrentUser())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
