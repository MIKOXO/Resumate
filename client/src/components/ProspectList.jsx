import { useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import TeamMemberListSkeleton from '@/components/TeamMemberListSkeleton'
import ReplaceResumeDialog from '@/components/ReplaceResumeDialog'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { cn } from '@/lib/utils'

const formatUpdatedAt = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  const options = { month: 'short', day: 'numeric' }
  if (date.getFullYear() !== new Date().getFullYear()) options.year = 'numeric'
  return date.toLocaleDateString(undefined, options)
}

const ProspectList = ({ member }) => {
  const { selectedProspectId, selectProspect, deleteProspect } = useTeamMembers()
  const [replaceFor, setReplaceFor] = useState(null)
  const [deleteFor, setDeleteFor] = useState(null)

  if (!member.prospectsLoaded) {
    return <TeamMemberListSkeleton rows={3} className="p-1" />
  }

  if (member.prospects.length === 0) {
    return <p className="px-2 py-1.5 text-xs text-muted">No prospects yet.</p>
  }

  return (
    <div className="space-y-0.5">
      {member.prospects.map((p) => (
        <div
          key={p._id}
          className={cn(
            'group flex items-center gap-1 rounded-md border px-2 py-1.5 transition-colors',
            selectedProspectId === p._id
              ? 'border-default bg-surface'
              : 'border-transparent hover:bg-surface',
          )}
        >
          <button
            type="button"
            onClick={() => selectProspect(p._id, member._id)}
            className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-primary"
            title={p.name}
          >
            {p.name}
          </button>
          <span className="shrink-0 text-xs text-muted">{formatUpdatedAt(p.uploadedAt)}</span>
          <button
            type="button"
            aria-label={`Replace resume for ${p.name}`}
            onClick={() => setReplaceFor(p)}
            className="cursor-pointer rounded-md p-1 text-muted transition-colors hover:text-primary"
          >
            <RefreshCw className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${p.name}`}
            onClick={() => setDeleteFor(p)}
            className="cursor-pointer rounded-md p-1 text-muted transition-colors hover:text-state-error"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {replaceFor && (
        <ReplaceResumeDialog
          open={!!replaceFor}
          onOpenChange={(o) => { if (!o) setReplaceFor(null) }}
          teamMemberId={member._id}
          prospect={replaceFor}
        />
      )}

      {deleteFor && (
        <DeleteConfirmDialog
          open={!!deleteFor}
          onOpenChange={(o) => { if (!o) setDeleteFor(null) }}
          title={`Delete ${deleteFor.name}?`}
          description={`This will permanently delete ${deleteFor.name} and its resume. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteProspect(member._id, deleteFor._id)}
        />
      )}
    </div>
  )
}

export default ProspectList
