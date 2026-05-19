"use client"

import { useState, useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload, X, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product"
import { slugify } from "@/lib/utils"
import type { ProductWithDetails, ProductImage } from "@/types"

interface EditProductDialogProps {
  product: ProductWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (updated: ProductWithDetails) => void
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: EditProductDialogProps) {
  const [tab, setTab] = useState<"info" | "images" | "pricing">("info")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: "",
      price: 0,
      inventory: 0,
      isActive: true,
      isFeatured: false,
    },
  })

  useEffect(() => {
    if (!product) return
    setExistingImages(product.images ?? [])
    setNewImageFiles([])
    setNewImagePreviews([])
    setTab("info")
    form.reset({
      name: product.name,
      categoryId: product.categoryId ?? undefined,
      description: product.description ?? undefined,
      manufacturer: product.manufacturer ?? undefined,
      warrantyInfo: product.warrantyInfo ?? undefined,
      originCountry: product.originCountry ?? undefined,
      weightGrams: product.weightGrams ?? undefined,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      inventory: product.inventory,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    })
  }, [product?.id])

  const loadCategories = async () => {
    if (categories.length > 0) return
    const res = await fetch("/api/admin/categories")
    const data = await res.json()
    setCategories(data.categories ?? [])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setNewImageFiles((prev) => [...prev, ...files])
    const previews = files.map((f) => URL.createObjectURL(f))
    setNewImagePreviews((prev) => [...prev, ...previews])
  }

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingImage = async (imageId: string) => {
    setDeletingImageId(imageId)
    try {
      const res = await fetch(`/api/admin/product-images/${imageId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success("Image removed")
    } catch {
      toast.error("Failed to remove image")
    } finally {
      setDeletingImageId(null)
    }
  }

  async function onSubmit(values: ProductFormValues) {
    if (!product) return
    setLoading(true)
    try {
      const slug = slugify(values.name)
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          slug,
          price: String(values.price),
          compareAtPrice: values.compareAtPrice ? String(values.compareAtPrice) : null,
        }),
      })
      if (!res.ok) throw new Error("Failed to update product")

      let uploadedImages: ProductImage[] = []
      if (newImageFiles.length > 0) {
        const basePosition = existingImages.length
        uploadedImages = await Promise.all(
          newImageFiles.map(async (file, i) => {
            const fd = new FormData()
            fd.append("file", file)
            fd.append("productId", product.id)
            const uploadRes = await fetch("/api/admin/product-images/upload", {
              method: "POST",
              body: fd,
            })
            if (!uploadRes.ok) throw new Error("Failed to upload image")
            const { url } = await uploadRes.json()

            const saveRes = await fetch("/api/admin/product-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: product.id, url, position: basePosition + i }),
            })
            if (!saveRes.ok) throw new Error("Failed to save image")
            const { image } = await saveRes.json()
            return image as ProductImage
          })
        )
      }

      const category = categories.find((c) => c.id === values.categoryId) ?? null
      const updatedProduct: ProductWithDetails = {
        ...product,
        ...values,
        slug,
        price: String(values.price),
        compareAtPrice: values.compareAtPrice ? String(values.compareAtPrice) : null,
        updatedAt: new Date(),
        category: category
          ? { ...product.category, id: category.id, name: category.name, slug: product.category?.slug ?? "", description: product.category?.description ?? null, displayOrder: product.category?.displayOrder ?? 0, createdAt: product.category?.createdAt ?? new Date() }
          : product.category,
        images: [...existingImages, ...uploadedImages],
        promotions: product.promotions,
      }

      toast.success("Product updated!", { description: values.name })
      window.dispatchEvent(new Event("product-updated"))
      onUpdated(updatedProduct)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Info */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        onOpenChange={loadCategories}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin Country</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none h-24"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty / Quality Note</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Active</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Featured</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setTab("images")}>
                    Next: Images
                  </Button>
                </div>
              </TabsContent>

              {/* Images */}
              <TabsContent value="images" className="space-y-4 mt-4">
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Current Images
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((img) => (
                        <div
                          key={img.id}
                          className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Remove image"
                            onClick={() => handleDeleteExistingImage(img.id)}
                            disabled={deletingImageId === img.id}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                          >
                            {deletingImageId === img.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Add more images (JPEG, PNG, WebP)
                  </p>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  </Button>
                </div>

                {newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {newImagePreviews.map((src, i) => (
                      <div
                        key={i}
                        className="relative group aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={src}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setTab("info")}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setTab("pricing")}>
                    Next: Pricing
                  </Button>
                </div>
              </TabsContent>

              {/* Pricing */}
              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Compare At ($){" "}
                          <span className="text-muted-foreground font-normal text-xs">opt</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Original price"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="inventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventory (units)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weightGrams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (grams)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="500"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setTab("images")}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {loading ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
