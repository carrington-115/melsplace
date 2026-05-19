"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Plus, FolderPlus, Tag, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { AddProductDialog } from "./add-product-dialog"
import { CreateCategoryDialog } from "./create-category-dialog"
import { AddPromotionDialog } from "./add-promotion-dialog"

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const [productOpen, setProductOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [promotionOpen, setPromotionOpen] = useState(false)

  return (
    <>
      <header className="h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {/* Quick actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setProductOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setCategoryOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
                Create Category
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setPromotionOpen(true)}
              >
                <Tag className="h-4 w-4" />
                Add Promotion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <UserButton />
        </div>
      </header>

      <AddProductDialog open={productOpen} onOpenChange={setProductOpen} />
      <CreateCategoryDialog open={categoryOpen} onOpenChange={setCategoryOpen} />
      <AddPromotionDialog open={promotionOpen} onOpenChange={setPromotionOpen} />
    </>
  )
}
