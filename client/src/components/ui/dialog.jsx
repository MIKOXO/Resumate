import { Dialog as DialogPrimitive } from 'radix-ui'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-default bg-elevated p-6 text-primary shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="absolute top-4 right-4 cursor-pointer rounded-sm opacity-70 ring-offset-base transition-opacity hover:opacity-100 focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-surface data-[state=open]:text-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />
}

function DialogFooter({ className, ...props }) {
  return <div data-slot="dialog-footer" className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn('text-base leading-none font-semibold text-primary', className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn('text-sm text-muted', className)} {...props} />
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
