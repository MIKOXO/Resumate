import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { BlockError, Spinner } from '@/components/authUi'
import { inputClass, outlineBtn, primaryBtn } from '@/lib/authUiHelpers'
import { cn } from '@/lib/utils'

const AddTeamMemberDialog = ({ open, onOpenChange }) => {
  const { createTeamMember, error, clearError } = useTeamMembers()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpenChange = (next) => {
    if (!next) {
      setName('')
      setSubmitting(false)
      clearError()
    }
    onOpenChange(next)
  }

  const valid = name.trim().length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || submitting) return
    clearError()
    setSubmitting(true)
    const result = await createTeamMember(name.trim())
    setSubmitting(false)
    if (result.meta?.requestStatus === 'fulfilled') {
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>
            Add a Job Applying team member to organize prospects under.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <BlockError message={error} onDismiss={clearError} />
          <div>
            <label className="mb-1 block text-xs text-muted">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError() }}
              placeholder="e.g. John"
              autoFocus
              className={inputClass(false)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className={cn(outlineBtn(), 'cursor-pointer')}>Cancel</button>
            </DialogClose>
            <button type="submit" disabled={!valid || submitting} className={cn(primaryBtn(!valid || submitting), 'sm:w-auto', 'cursor-pointer', 'px-5', 'text-sm')}>
              {submitting ? <Spinner /> : 'Add team member'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberDialog
