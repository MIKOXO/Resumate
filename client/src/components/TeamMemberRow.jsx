import { useState } from 'react'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import ProspectList from '@/components/ProspectList'
import AddProspectDialog from '@/components/AddProspectDialog'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { cn } from '@/lib/utils'

const TeamMemberRow = ({ member }) => {
  const { toggleExpand, deleteTeamMember, fetchProspectsForTeamMember } = useTeamMembers()
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDeleteClick = async () => {
    if (!member.prospectsLoaded) {
      const result = await fetchProspectsForTeamMember(member._id)
      if (result.meta?.requestStatus === 'rejected') return
    }
    setDeleteOpen(true)
  }

  const count = member.prospects?.length ?? 0
  const description =
    count > 0
      ? `This will also delete ${count} prospect${count === 1 ? '' : 's'} and their resume${count === 1 ? '' : 's'}. This cannot be undone.`
      : 'No prospects are associated with this team member. This cannot be undone.'

  return (
    <Collapsible
      open={member.expanded}
      onOpenChange={() => toggleExpand(member._id)}
      className="border-b border-default"
    >
      <div className="flex items-center gap-1 px-3 py-1">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-surface"
          >
            <ChevronRight
              className={cn(
                'size-4 shrink-0 text-muted transition-transform duration-200',
                member.expanded && 'rotate-90',
              )}
            />
            <span className="truncate text-sm text-primary">{member.name}</span>
            {member.prospectsLoaded && (
              <span className="ml-auto rounded-sm border border-default px-1.5 py-px text-xs tabular-nums text-muted">
                {count}
              </span>
            )}
          </button>
        </CollapsibleTrigger>
        <button
          type="button"
          aria-label={`Delete ${member.name}`}
          onClick={handleDeleteClick}
          className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:text-state-error"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <CollapsibleContent>
        <div className="px-3 pb-2 pl-7">
          <ProspectList member={member} />
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-1 flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-primary"
          >
            <Plus className="size-4" />
            Add prospect
          </button>
        </div>
      </CollapsibleContent>

      <AddProspectDialog open={addOpen} onOpenChange={setAddOpen} teamMemberId={member._id} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${member.name}?`}
        description={description}
        confirmLabel="Delete"
        onConfirm={() => deleteTeamMember(member._id)}
      />
    </Collapsible>
  )
}

export default TeamMemberRow
