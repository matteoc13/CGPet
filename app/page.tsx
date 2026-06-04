import { SiteHeader, SiteFooter } from "@/components/site-header"
import { PawPrint } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid max-w-xl place-items-center px-6 py-24 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-cream">
          <PawPrint className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
          Escaneie seu pingente CGPet
        </h1>
        <p className="mt-4 text-muted-foreground text-pretty">
          Cada pingente tem um QR unico no verso. Escaneie com a camera do seu celular para abrir
          a pagina do seu pet - nao ha nada a fazer por aqui.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
