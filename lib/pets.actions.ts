"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

async function hashPin(pin: string, code: string): Promise<string> {
  const data = new TextEncoder().encode(`${pin}::${code.toUpperCase()}`)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

const CodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{3,16}$/, "Code must be 3-16 letters or digits")
  .transform((s) => s.toUpperCase())

const PinSchema = z.string().regex(/^\d{4,8}$/, "PIN must be 4-8 digits")

const PetFieldsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  species: z.enum(["dog", "cat"]),
  breed: z.string().trim().max(80).optional().or(z.literal("")),
  color: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(600).optional().or(z.literal("")),
  photo_url: z.string().trim().max(500).optional().or(z.literal("")),
  owner_name: z.string().trim().min(1).max(80),
  whatsapp: z
    .string()
    .trim()
    .min(5)
    .max(32)
    .regex(/^[+0-9 ()-]+$/, "Use digits, spaces, +, (), or -"),
})

const RegisterSchema = PetFieldsSchema.extend({
  code: CodeSchema,
  pin: PinSchema,
})

async function resolvePhotoUrl(stored: string | null): Promise<string | null> {
  if (!stored) return null
  if (/^https?:\/\//i.test(stored)) return stored
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from("pet-photos")
    .createSignedUrl(stored, 60 * 60 * 24 * 7)
  if (error) return null
  return data?.signedUrl ?? null
}

export async function getPetByCode(code: string) {
  const parsedCode = CodeSchema.parse(code)
  const supabase = await createClient()
  
  const { data: pet, error } = await supabase
    .from("pets")
    .select("id, code, name, species, breed, color, notes, photo_url, owner_name, whatsapp")
    .ilike("code", parsedCode)
    .maybeSingle()
    
  if (error) throw new Error(error.message)
  
  if (pet) {
    pet.photo_url = await resolvePhotoUrl(pet.photo_url)
  }
  
  return { pet }
}

export async function registerPet(formData: {
  code: string
  name: string
  species: "dog" | "cat"
  breed?: string
  color?: string
  notes?: string
  photo_url?: string
  owner_name: string
  whatsapp: string
  pin: string
}) {
  const data = RegisterSchema.parse(formData)
  const supabase = await createClient()
  
  const code = data.code
  const pin_hash = await hashPin(data.pin, code)

  const { data: existing } = await supabase
    .from("pets")
    .select("id")
    .ilike("code", code)
    .maybeSingle()
    
  if (existing) throw new Error("This code is already registered")

  const { error } = await supabase.from("pets").insert({
    code,
    name: data.name,
    species: data.species,
    breed: data.breed || null,
    color: data.color || null,
    notes: data.notes || null,
    photo_url: data.photo_url || null,
    owner_name: data.owner_name,
    whatsapp: data.whatsapp,
    pin_hash,
  })

  if (error) throw new Error(error.message)
  return { code }
}

const UpdateSchema = PetFieldsSchema.partial().extend({
  code: CodeSchema,
  pin: PinSchema,
})

export async function updatePet(formData: {
  code: string
  pin: string
  name?: string
  species?: "dog" | "cat"
  breed?: string
  color?: string
  notes?: string
  photo_url?: string
  owner_name?: string
  whatsapp?: string
}) {
  const data = UpdateSchema.parse(formData)
  const supabase = await createClient()

  const { data: row, error: readErr } = await supabase
    .from("pets")
    .select("id, code, pin_hash")
    .ilike("code", data.code)
    .maybeSingle()

  if (readErr) throw new Error(readErr.message)
  if (!row) throw new Error("Pet not found")

  const expected = await hashPin(data.pin, row.code)
  if (expected !== row.pin_hash) throw new Error("Incorrect PIN")

  const norm = (v: string | undefined) =>
    v === undefined ? undefined : v === "" ? null : v

  const { error: upErr } = await supabase
    .from("pets")
    .update({
      updated_at: new Date().toISOString(),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.species !== undefined ? { species: data.species } : {}),
      ...(data.breed !== undefined ? { breed: norm(data.breed) } : {}),
      ...(data.color !== undefined ? { color: norm(data.color) } : {}),
      ...(data.notes !== undefined ? { notes: norm(data.notes) } : {}),
      ...(data.photo_url !== undefined ? { photo_url: norm(data.photo_url) } : {}),
      ...(data.owner_name !== undefined ? { owner_name: data.owner_name } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
    })
    .eq("id", row.id)

  if (upErr) throw new Error(upErr.message)
  return { ok: true }
}

export async function verifyPin(code: string, pin: string) {
  const parsedCode = CodeSchema.parse(code)
  const parsedPin = PinSchema.parse(pin)
  const supabase = await createClient()
  
  const { data: row, error } = await supabase
    .from("pets")
    .select("code, pin_hash")
    .ilike("code", parsedCode)
    .maybeSingle()
    
  if (error) throw new Error(error.message)
  if (!row) throw new Error("Pet not found")
  
  const expected = await hashPin(parsedPin, row.code)
  return { ok: expected === row.pin_hash }
}
