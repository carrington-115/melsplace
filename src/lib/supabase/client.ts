import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split(".").pop()
  const path = `${productId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from("products").getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage given its public URL.
 */
export async function deleteProductImage(url: string): Promise<void> {
  const path = url.split("/storage/v1/object/public/products/")[1]
  if (!path) return
  await supabase.storage.from("products").remove([path])
}
