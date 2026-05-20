"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"

// ─── Internal Zustand store (localStorage) ───────────────────────────────────

interface WishlistStoreState {
  productIds: string[]
  _toggle: (productId: string) => void
  _setIds: (ids: string[]) => void
  isWishlisted: (productId: string) => boolean
}

const useWishlistStoreBase = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      productIds: [],

      _toggle: (productId) => {
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        }))
      },

      _setIds: (ids) => set({ productIds: ids }),

      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: "melsplace-wishlist" }
  )
)

// ─── Public hook with DB sync ─────────────────────────────────────────────────

export function useWishlistStore() {
  const { user } = useUser()
  const store = useWishlistStoreBase()
  const userIdRef = useRef<string | undefined>(undefined)
  const syncedRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    userIdRef.current = user?.id
  }, [user?.id])

  // On login: fetch DB wishlist and merge with localStorage
  useEffect(() => {
    if (!user?.id || syncedRef.current === user.id) return
    syncedRef.current = user.id

    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data: { productIds?: string[] }) => {
        if (!data.productIds) return
        const localIds = useWishlistStoreBase.getState().productIds
        const merged = Array.from(new Set([...localIds, ...data.productIds]))
        useWishlistStoreBase.getState()._setIds(merged)
        // Push local-only IDs to DB
        const dbSet = new Set(data.productIds)
        localIds.forEach((id) => {
          if (!dbSet.has(id)) {
            fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: id }),
            }).catch(console.error)
          }
        })
      })
      .catch(console.error)
  }, [user?.id])

  const toggle = (productId: string) => {
    store._toggle(productId)
    if (userIdRef.current) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(console.error)
    }
  }

  return {
    productIds: store.productIds,
    toggle,
    isWishlisted: store.isWishlisted,
  }
}
