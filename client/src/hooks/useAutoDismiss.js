import { useState, useEffect } from 'react'

export default function useAutoDismiss(message, focused, { enabled = true, timeout = 4000 } = {}) {
  const [hidden, setHidden] = useState(false)
  const [prevFocused, setPrevFocused] = useState(focused)
  const [prevMessage, setPrevMessage] = useState(message)

  if (focused !== prevFocused) {
    setPrevFocused(focused)
    if (focused) setHidden(false)
  }

  if (message !== prevMessage) {
    setPrevMessage(message)
    if (message) setHidden(false)
  }

  useEffect(() => {
    if (!enabled || !message || hidden || focused) return
    const id = setTimeout(() => setHidden(true), timeout)
    return () => clearTimeout(id)
  }, [enabled, message, hidden, focused, timeout])

  return message && !hidden
}
