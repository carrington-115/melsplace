"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import type { ProductWithCategory, LocalCartItem } from "@/types"

// ─── Internal Zustand store (localStorage) ───────────────────────────────────

interface CartStoreState {
  items: LocalCartItem[]
  _addItem: (product: ProductWithCategory, quantity?: number) => void
  _removeItem: (productId: string) => void
  _updateQuantity: (productId: string, quantity: number) => void
  _clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

const useCartStoreBase = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      _addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.inventory) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { productId: product.id, quantity, product }] }
        })
      },

      _removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }))
      },

      _updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get()._removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      _clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        ),
    }),
    { name: "melsplace-cart" }
  )
)

// ─── Public hook with DB sync ─────────────────────────────────────────────────

export function useCartStore() {
  const { user } = useUser()
  const store = useCartStoreBase()
  const userIdRef = useRef<string | undefined>(undefined)
  const syncedRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    userIdRef.current = user?.id
  }, [user?.id])

  // On login: fetch DB cart and merge into local store
  useEffect(() => {
    if (!user?.id || syncedRef.current === user.id) return
    syncedRef.current = user.id

    fetch("/api/cart")
      .then((r) => r.json())
      .then((data: { items?: Array<{ productId: string; quantity: number; product: ProductWithCategory }> }) => {
        if (!data.items) return
        const localItems = useCartStoreBase.getState().items
        // Add DB items not already in local cart
        data.items.forEach((dbItem) => {
          const local = localItems.find((l) => l.productId === dbItem.productId)
          if (!local) {
            useCartStoreBase.getState()._addItem(dbItem.product, dbItem.quantity)
          }
        })
        // Push local-only items to DB
        const dbProductIds = new Set(data.items.map((i) => i.productId))
        localItems.forEach((localItem) => {
          if (!dbProductIds.has(localItem.productId)) {
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: localItem.productId, quantity: localItem.quantity }),
            }).catch(console.error)
          }
        })
      })
      .catch(console.error)
  }, [user?.id])

  const addItem = (product: ProductWithCategory, quantity = 1) => {
    store._addItem(product, quantity)
    if (userIdRef.current) {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      }).catch(console.error)
    }
  }

  const removeItem = (productId: string) => {
    store._removeItem(productId)
    if (userIdRef.current) {
      fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(console.error)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    store._updateQuantity(productId, quantity)
    if (userIdRef.current) {
      if (quantity <= 0) {
        fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(console.error)
      } else {
        fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        }).catch(console.error)
      }
    }
  }

  const clearCart = () => {
    store._clearCart()
    if (userIdRef.current) {
      fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(console.error)
    }
  }

  return {
    items: store.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount: store.getItemCount,
    getSubtotal: store.getSubtotal,
  }
}
