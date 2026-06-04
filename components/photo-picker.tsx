"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Camera, Loader2, PawPrint } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function PhotoPicker({
  code,
  preview,
  onUploaded,
}: {
  code: string
  preview: string | null
  onUploaded: (path: string, previewUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 8 MB")
      return
    }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")
      const path = `${code}/${crypto.randomUUID()}.${ext || "jpg"}`
      const { error } = await supabase.storage.from("pet-photos").upload(path, file, {
        upsert: false,
        contentType: file.type,
      })
      if (error) throw error
      onUploaded(path, URL.createObjectURL(file))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nao foi possivel enviar a foto")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-sand to-clay/60">
        {preview ? (
          <img src={preview} alt="Pet preview" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <PawPrint className="h-8 w-8 text-primary/60" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {preview ? "Trocar foto" : "Adicionar foto"}
        </button>
        <p className="mt-1.5 text-xs text-muted-foreground">JPG ou PNG, ate 8 MB.</p>
      </div>
    </div>
  )
}
