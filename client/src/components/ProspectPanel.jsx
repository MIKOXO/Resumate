import { useState } from 'react'
import { Plus, User } from 'lucide-react'
import { useProspects } from '@/hooks/useProspects'
import EmptyState from '@/components/EmptyState'
import ProspectList from '@/components/ProspectList'
import AddProspectDialog from '@/components/AddProspectDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { BlockError } from '@/components/authUi'
import { actionButtonRadius } from '@/lib/authUiHelpers'

const ProspectPanel = () => {
  const { list, loading, error, clearError } = useProspects()
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
          Add prospect
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
            <div aria-hidden="true" className="space-y-1 p-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="size-8 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              className="w-full pt-16"
              icon={User}
              title="No prospects yet"
              subtitle="Add one to get started on a resume."
            />
          ) : (
            <div className="py-1">
              <ProspectList />
            </div>
          )}
        </div>
      </div>

      <AddProspectDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

export default ProspectPanel