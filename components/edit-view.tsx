"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Lock } from "lucide-react"
import { verifyPin, updatePet } from "@/lib/pets.actions"
import { PhotoPicker } from "./photo-picker"
import { Field } from "./form-field"

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

export function EditView({
  code,
  pet,
  onCancel,
}: {
  code: string
  pet: Pet
  onCancel: () => void
}) {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState("")
  const [isPending, startTransition] = useTransition()
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet.photo_url ?? null)

  function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const res = await verifyPin(code, pin)
        if (res.ok) setUnlocked(true)
        else toast.error("PIN incorreto")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Nao foi possivel verificar")
      }
    })
  }

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updatePet({
          code,
          pin,
          name: String(fd.get("name") ?? ""),
          species: (fd.get("species") as "dog" | "cat") ?? "dog",
          breed: String(fd.get("breed") ?? ""),
          color: String(fd.get("color") ?? ""),
          notes: String(fd.get("notes") ?? ""),
          ...(photoPath !== null ? { photo_url: photoPath } : {}),
          owner_name: String(fd.get("owner_name") ?? ""),
          whatsapp: String(fd.get("whatsapp") ?? ""),
        })
        toast.success("Salvo")
        router.refresh()
        onCancel()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Nao foi possivel salvar")
      }
    })
  }

  return (
    <>
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o pet
      </button>

      {!unlocked ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">Digite seu PIN</h1>
              <p className="text-sm text-muted-foreground">
                O PIN que voce definiu ao registrar {pet.name}.
              </p>
            </div>
          </div>
          <form onSubmit={onVerify} className="mt-6 flex gap-2">
            <input
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              pattern="\d{4,8}"
              type="password"
              placeholder="••••"
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              disabled={isPending || pin.length < 4}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Desbloquear
            </button>
          </form>
        </div>
      ) : (
        <form
          onSubmit={onSave}
          className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
        >
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Editar {pet.name}</h1>
          <PhotoPicker
            code={code}
            preview={photoPreview}
            onUploaded={(path, preview) => {
              setPhotoPath(path)
              setPhotoPreview(preview)
            }}
          />
          <Field label="Nome do pet" name="name" required defaultValue={pet.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field as="select" label="Especie" name="species" defaultValue={pet.species}>
              <option value="dog">Cachorro</option>
              <option value="cat">Gato</option>
            </Field>
            <Field label="Raca" name="breed" defaultValue={pet.breed ?? ""} />
          </div>
          <Field label="Cor / marcas" name="color" defaultValue={pet.color ?? ""} />
          <Field as="textarea" label="Observacoes" name="notes" rows={3} defaultValue={pet.notes ?? ""} />
          <Field label="Seu nome" name="owner_name" required defaultValue={pet.owner_name} />
          <Field label="WhatsApp" name="whatsapp" required defaultValue={pet.whatsapp} />

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alteracoes
          </button>
        </form>
      )}
    </>
  )
}
