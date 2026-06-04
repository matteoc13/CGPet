"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, PawPrint } from "lucide-react"
import { registerPet } from "@/lib/pets.actions"
import { PhotoPicker } from "./photo-picker"
import { Field } from "./form-field"

export function RegisterView({ code }: { code: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pin = String(fd.get("pin") ?? "")
    const pin2 = String(fd.get("pin2") ?? "")
    
    if (pin !== pin2) {
      toast.error("Os PINs nao coincidem")
      return
    }
    
    startTransition(async () => {
      try {
        await registerPet({
          code,
          name: String(fd.get("name") ?? ""),
          species: (fd.get("species") as "dog" | "cat") ?? "dog",
          breed: String(fd.get("breed") ?? ""),
          color: String(fd.get("color") ?? ""),
          notes: String(fd.get("notes") ?? ""),
          photo_url: photoPath ?? "",
          owner_name: String(fd.get("owner_name") ?? ""),
          whatsapp: String(fd.get("whatsapp") ?? ""),
          pin,
        })
        toast.success("Seu pet foi registrado!")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Algo deu errado")
      }
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-3 py-1 text-xs font-medium text-muted-foreground">
        <PawPrint className="h-3.5 w-3.5" /> Pingente {code}
      </span>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
        Bem-vindo - vamos configurar a pagina do seu pet
      </h1>
      <p className="mt-2 text-muted-foreground">
        Este pingente ainda nao esta vinculado a um pet. Preencha os dados abaixo e escolha um PIN -
        voce precisara dele depois para atualizar esta pagina.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <Section title="Sobre o seu pet">
          <PhotoPicker
            code={code}
            preview={photoPreview}
            onUploaded={(path, preview) => {
              setPhotoPath(path)
              setPhotoPreview(preview)
            }}
          />
          <Field label="Nome do pet" name="name" required placeholder="Biscoito" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field as="select" label="Especie" name="species" defaultValue="dog">
              <option value="dog">Cachorro</option>
              <option value="cat">Gato</option>
            </Field>
            <Field label="Raca" name="breed" placeholder="SRD" />
          </div>
          <Field label="Cor / marcas" name="color" placeholder="Dourado, peito branco" />
          <Field
            as="textarea"
            label="Observacoes uteis (alergias, comportamento, medicacao...)"
            name="notes"
            rows={3}
            placeholder="Timido com estranhos. Alergico a frango."
          />
        </Section>

        <Section title="Contato (mostrado para quem encontrar seu pet)">
          <Field label="Seu nome" name="owner_name" required placeholder="Marina" />
          <Field
            label="Numero do WhatsApp (com codigo do pais)"
            name="whatsapp"
            required
            placeholder="+55 11 91234 5678"
          />
        </Section>

        <Section
          title="Defina um PIN de edicao"
          description="4 a 8 digitos. Voce precisara dele para editar esta pagina depois. Nao perca."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PIN" name="pin" required inputMode="numeric" pattern="\d{4,8}" type="password" placeholder="••••" />
            <Field label="Confirmar PIN" name="pin2" required inputMode="numeric" pattern="\d{4,8}" type="password" placeholder="••••" />
          </div>
        </Section>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar a pagina do meu pet
        </button>
      </form>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
