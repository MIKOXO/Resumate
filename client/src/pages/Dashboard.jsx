import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import TopBar from '@/components/TopBar'
import EmptyState from '@/components/EmptyState'
import TeamMemberTree from '@/components/TeamMemberTree'
import GenerateWorkspace from '@/components/GenerateWorkspace'
import { fetchTeamMembers } from '@/store/slices/teamMembersSlice'

const SHELL_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const selectedProspectId = useSelector((s) => s.teamMembers.selectedProspectId)

  useEffect(() => {
    dispatch(fetchTeamMembers())
  }, [dispatch])

  return (
    <motion.div {...SHELL_ANIM} className="flex min-h-svh flex-col bg-base md:h-svh">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        <aside className="flex min-h-0 flex-1 flex-col border-b border-default bg-base md:w-[260px] md:flex-none md:border-b-0 md:border-r">
          <TeamMemberTree />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-base">
          {selectedProspectId
            ? <GenerateWorkspace />
            : <EmptyState className="w-full flex-1" icon={FileText} title="Select a prospect to get started" />}
        </main>
      </div>
    </motion.div>
  )
}

export default Dashboard
