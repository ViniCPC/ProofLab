import { Menu, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { landingContent } from '@/content/landing'
import { LinkButton } from '@/components/ui/LinkButton'

export function MobileMenu() {
  const { nav } = landingContent
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={nav.menuLabel}
          className="grid size-10 place-items-center rounded-lg border border-slate-700 text-slate-200 hover:border-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 md:hidden"
        >
          <Menu aria-hidden className="size-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col border-l border-slate-800 bg-[#080c14] p-6 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-sm font-semibold text-white">
              ProofLab
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={nav.closeLabel}
                className="grid size-10 place-items-center rounded-lg border border-slate-700 text-slate-300 hover:border-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                <X aria-hidden className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="mt-10 flex flex-col gap-2" aria-label="Navegação mobile">
            {nav.links.map((link) => (
              <Dialog.Close asChild key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base text-slate-300 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  {link.label}
                </a>
              </Dialog.Close>
            ))}
          </nav>
          <Dialog.Close asChild>
            <LinkButton to="/explore" size="lg" className="mt-auto w-full">
              {nav.appCta}
            </LinkButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
