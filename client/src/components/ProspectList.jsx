import { useState } from 'react'
import { MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProspects } from '@/hooks/useProspects'
import ReplaceResumeDialog from '@/components/ReplaceResumeDialog'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { cn } from '@/lib/utils'
import { compactControlRadius } from '@/lib/authUiHelpers'

const ProspectList = () => {
  const { list, selectedProspectId, selectProspect, deleteProspect } = useProspects()
  const [replaceFor, setReplaceFor] = useState(null)
  const [deleteFor, setDeleteFor] = useState(null)

  return (
    <div className="space-y-0.5">
      {list.map((p) => (
        <div
          key={p._id}
          className={cn(
            'group mx-3 flex items-center gap-1 rounded-md border px-2 py-1.5 transition-colors',
            selectedProspectId === p._id
              ? 'border-default bg-surface'
              : 'border-transparent hover:bg-surface',
          )}
        >
          <button
            type="button"
            onClick={() => selectProspect(p._id)}
            className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm text-primary"
          >
            {p.name}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Actions for ${p.name}`}
                className={`cursor-pointer ${compactControlRadius} p-1 text-muted transition-colors outline-none hover:bg-surface hover:text-primary focus-visible:ring-2 focus-visible:ring-accent-primary/40`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setReplaceFor(p)}>
                <RefreshCw />
                Replace resume
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteFor(p)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {replaceFor && (
        <ReplaceResumeDialog
          open={!!replaceFor}
          onOpenChange={(o) => { if (!o) setReplaceFor(null) }}
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
          onConfirm={() => deleteProspect(deleteFor._id)}
        />
      )}
    </div>
  )
}

export default ProspectList
