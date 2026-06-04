import { getPetByCode } from "@/lib/pets.actions"
import { SiteHeader, SiteFooter } from "@/components/site-header"
import { PetView } from "@/components/pet-view"
import { RegisterView } from "@/components/register-view"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `Pet ${code.toUpperCase()} - CGPet`,
    description: "Escaneie um pingente CGPet para ver o perfil do pet e falar com o tutor no WhatsApp.",
  }
}

export default async function PetPage({ params }: Props) {
  const { code } = await params
  const { pet } = await getPetByCode(code)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        {pet ? (
          <PetView code={code.toUpperCase()} pet={pet} />
        ) : (
          <RegisterView code={code.toUpperCase()} />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
