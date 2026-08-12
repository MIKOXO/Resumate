import { motion } from 'framer-motion'
import { Users, FileText } from 'lucide-react'
import TopBar from '@/components/TopBar'
import EmptyState from '@/components/EmptyState'

const SHELL_ANIM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

const Dashboard = () => {
  return (
    <motion.div {...SHELL_ANIM} className="flex h-svh flex-col bg-base">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[260px] shrink-0 flex-col overflow-y-auto border-r border-default bg-base md:flex">
          <EmptyState
            className="w-full flex-1"
            icon={Users}
            title="No team members yet"
            subtitle="Add one to start organizing prospects."
          />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-base">
          <EmptyState className="w-full flex-1" icon={FileText} title="Select a prospect to get started" />
        </main>
      </div>
    </motion.div>
  )
}

export default Dashboard
