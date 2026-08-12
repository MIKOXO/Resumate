import Logo from '@/components/Logo'
import UserMenu from '@/components/UserMenu'

const TopBar = () => (
  <header className="flex h-12 shrink-0 items-center justify-between border-b border-default bg-base px-4">
    <Logo />
    <UserMenu />
  </header>
)

export default TopBar
