"use client"

import { useState } from "react"
import { MessageCircle, MapPin, PawPrint, Pencil } from "lucide-react"
import { EditView } from "./edit-view"

type Pet = {
  id: string
  code: string
  name: string
  species: string
  breed: string | null
  color: string | null
  notes: string | null
  photo_url: string | null
  owner_name: string
  whatsapp: string
}

export function PetView({ code, pet }: { code: string; pet: Pet }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <EditView code={code} pet={pet} onCancel={() => setEditing(false)} />
  }

  const waNumber = pet.whatsapp.replace(/[^\d]/g, "")
  const waText = encodeURIComponent(
    `Ola ${pet.owner_name}! Encontrei ${pet.name} (CGPet ${code}). Esta em seguranca comigo.`
  )
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`

  return (
    <div className="rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="relative">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="aspect-[4/3] w-full rounded-t-3xl object-cover"
          />
        ) : (
          <div className="grid aspect-[4/3] w-full place-items-center rounded-t-3xl bg-gradient-to-br from-sand to-clay/60">
            <PawPrint className="h-20 w-20 text-primary/60" />
          </div>
        )}
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
          <PawPrint className="h-3.5 w-3.5 text-primary" /> {code}
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Se encontrado, por favor contate
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Oi, eu sou {pet.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground capitalize">
            {[pet.breed, pet.color, pet.species].filter(Boolean).join(" · ")}
          </p>
        </div>

        {pet.notes && (
          <div className="rounded-2xl bg-cream/70 p-4 text-sm leading-relaxed">{pet.notes}</div>
        )}

        <div className="space-y-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[oklch(0.62_0.16_150)] px-6 py-3.5 font-medium text-white shadow-[var(--shadow-card)] transition hover:opacity-90"
          >
            <MessageCircle className="h-5 w-5" />
            Falar com {pet.owner_name} no WhatsApp
          </a>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Por favor, informe onde voce encontrou {pet.name} ao enviar a mensagem.
          </p>
        </div>

        <div className="border-t border-border/60 pt-5">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            E o tutor? Editar esta pagina
          </button>
        </div>
      </div>
    </div>
  )
}
