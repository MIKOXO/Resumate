import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import TopBar from '@/components/TopBar'
import EmptyState from '@/components/EmptyState'
import TeamMemberTree from '@/components/TeamMemberTree'
import { fetchTeamMembers } from '@/store/slices/teamMembersSlice'

const SHELL_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

const Dashboard = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchTeamMembers())
  }, [dispatch])

  return (
    <motion.div {...SHELL_ANIM} className="flex h-svh flex-col bg-base">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-full min-h-0 flex-col bg-base md:w-[260px] md:shrink-0 md:border-r md:border-default">
          <TeamMemberTree />
        </aside>
        <main className="hidden min-w-0 flex-1 flex-col overflow-y-auto bg-base md:flex">
          <EmptyState className="w-full flex-1" icon={FileText} title="Select a prospect to get started" />
        </main>
      </div>
    </motion.div>
  )
}

export default Dashboard
