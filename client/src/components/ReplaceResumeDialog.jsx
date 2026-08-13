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
import { validateProspectFile } from '@/lib/prospectFile'
import { BlockError, FieldError, Spinner } from '@/components/authUi'
import { outlineBtn, primaryBtn } from '@/lib/authUiHelpers'
import { cn } from '@/lib/utils'

const ReplaceResumeDialog = ({ open, onOpenChange, teamMemberId, prospect }) => {
  const { replaceProspectResume, error, clearError } = useTeamMembers()
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpenChange = (next) => {
    if (!next) {
      setFile(null)
      setFileError('')
      setSubmitting(false)
      clearError()
    }
    onOpenChange(next)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setFileError(validateProspectFile(selected))
    clearError()
  }

  const valid = !!file && !fileError

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || submitting) return
    clearError()
    setSubmitting(true)
    const result = await replaceProspectResume(teamMemberId, prospect._id, file)
    setSubmitting(false)
    if (result.meta?.requestStatus === 'fulfilled') {
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Replace resume</DialogTitle>
          <DialogDescription>
            Choose a new default resume for {prospect.name}. The previous file will be overwritten.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <BlockError message={error} onDismiss={clearError} />
          <div>
            <label className="mb-1 block text-xs text-muted">New resume (.docx)</label>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-strong file:bg-elevated file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary file:transition-colors hover:file:border-default"
            />
            <FieldError message={fileError} show={!!fileError} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className={cn(outlineBtn(), 'cursor-pointer')}>Cancel</button>
            </DialogClose>
            <button type="submit" disabled={!valid || submitting} className={cn(primaryBtn(!valid || submitting), 'sm:w-auto', 'cursor-pointer', 'px-5', 'text-sm')}>
              {submitting ? <Spinner /> : 'Replace'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReplaceResumeDialog
