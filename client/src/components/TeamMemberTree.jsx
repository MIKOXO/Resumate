import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import TeamMemberListSkeleton from '@/components/TeamMemberListSkeleton'
import EmptyState from '@/components/EmptyState'
import TeamMemberRow from '@/components/TeamMemberRow'
import AddTeamMemberDialog from '@/components/AddTeamMemberDialog'
import { BlockError } from '@/components/authUi'
import { actionButtonRadius } from '@/lib/authUiHelpers'

const TeamMemberTree = () => {
  const { list, loading, error, clearError } = useTeamMembers()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-default p-3">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 ${actionButtonRadius} border border-strong py-2 text-sm font-medium text-primary transition-colors hover:border-default hover:bg-surface`}
        >
          <Plus className="size-4" />
          Add team member
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {error && (
          <div className="shrink-0 px-3 pt-3">
            <BlockError message={error} onDismiss={clearError} />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <TeamMemberListSkeleton />
          ) : list.length === 0 ? (
            <EmptyState
              className="w-full pt-16"
              icon={Users}
              title="No team members yet"
              subtitle="Add one to start organizing prospects."
            />
          ) : (
            <div className="py-1">
              {list.map((member) => (
                <TeamMemberRow key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddTeamMemberDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

export default TeamMemberTree
