import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '@/services/authService'

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.me()
    if (!res.data?.data) return rejectWithValue(null)
    return res.data.data
  } catch {
    return rejectWithValue(null)
  }
})

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await authService.login(email, password)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed')
  }
})

export const signup = createAsyncThunk('auth/signup', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const res = await authService.signup(name, email, password)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Signup failed')
  }
})

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async ({ code }, { rejectWithValue }) => {
  try {
    const res = await authService.verifyEmail(code)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Verification failed')
  }
})

export const resendVerificationCode = createAsyncThunk('auth/resendVerificationCode', async ({ email }, { rejectWithValue }) => {
  try {
    await authService.resendCode(email)
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Resend failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Logout failed')
  }
})

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async ({ email }, { rejectWithValue }) => {
  try {
    await authService.forgotPassword(email)
    return email
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Request failed')
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ code, newPassword, confirmPassword }, { rejectWithValue }) => {
  try {
    const res = await authService.resetPassword(code, newPassword, confirmPassword)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Reset failed')
  }
})

export const updateName = createAsyncThunk('auth/updateName', async ({ name }, { rejectWithValue }) => {
  try {
    const res = await authService.updateName(name)
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Update failed')
  }
})

export const changePassword = createAsyncThunk('auth/changePassword', async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    await authService.changePassword(currentPassword, newPassword)
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Password change failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    nameLoading: false,
    nameError: null,
    passwordLoading: false,
    passwordError: null,
    authReady: false,
    resetFlow: { step: 'request', email: '' },
  },
  reducers: {
    clearError: (state) => { state.error = null },
    clearNameError: (state) => { state.nameError = null },
    clearPasswordError: (state) => { state.passwordError = null },
    setResetStep: (state, action) => { state.resetFlow.step = action.payload },
    resetResetFlow: (state) => { state.resetFlow = { step: 'request', email: '' } },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
        state.authReady = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.authReady = true
      })

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(login.rejected, rejected)

      .addCase(signup.pending, pending)
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(signup.rejected, rejected)

      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(verifyEmail.rejected, rejected)

      .addCase(resendVerificationCode.pending, pending)
      .addCase(resendVerificationCode.fulfilled, (state) => { state.loading = false })
      .addCase(resendVerificationCode.rejected, rejected)

      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
      })

      .addCase(requestPasswordReset.pending, pending)
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false
        state.resetFlow = { step: 'otp', email: action.payload }
      })
      .addCase(requestPasswordReset.rejected, rejected)

      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.resetFlow = { step: 'request', email: '' }
      })
      .addCase(resetPassword.rejected, rejected)

      .addCase(updateName.pending, (state) => {
        state.nameLoading = true
        state.nameError = null
      })
      .addCase(updateName.fulfilled, (state, action) => {
        state.nameLoading = false
        state.user = action.payload
      })
      .addCase(updateName.rejected, (state, action) => {
        state.nameLoading = false
        state.nameError = action.payload
      })

      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true
        state.passwordError = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false
        state.passwordError = action.payload
      })
  },
})

export const { clearError, clearNameError, clearPasswordError, setResetStep, resetResetFlow } = authSlice.actions
export default authSlice.reducer
