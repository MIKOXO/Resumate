import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Collapsible(props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ className, ...props }) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  )
}

function CollapsibleContent({ className, ...props }) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn('overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down', className)}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
