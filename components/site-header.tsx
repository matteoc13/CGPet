import Link from "next/link"
import { PawPrint } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold">
          <PawPrint className="h-7 w-7 text-primary" />
          CGPet
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            Escaneie o pingente para abrir a pagina do seu pet
          </span>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-cream/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} CGPet - trazendo eles para casa.</p>
        <p>Feito com carinho para os pets e quem os ama.</p>
      </div>
    </footer>
  )
}
