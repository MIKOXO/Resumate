import { Skeleton } from '@/components/ui/skeleton'

const TeamMemberListSkeleton = ({ rows = 5 }) => (
  <div aria-hidden="true" className="space-y-1 p-3">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3 px-2 py-2">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
      </div>
    ))}
  </div>
)

export default TeamMemberListSkeleton
