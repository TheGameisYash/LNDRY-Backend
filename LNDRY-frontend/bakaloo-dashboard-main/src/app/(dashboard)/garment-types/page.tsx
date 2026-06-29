"use client"

import { useState } from "react"
import { Plus, Search, Trash2, Edit2 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Mock Garment Types matching blueprint §5
const MOCK_GARMENTS = [
  { id: "g_1", name: "Shirt / T-Shirt", unit: "PIECE", minQty: 1, maxQty: 50 },
  { id: "g_2", name: "Trousers / Jeans", unit: "PIECE", minQty: 1, maxQty: 50 },
  { id: "g_3", name: "Bed Sheet (Double)", unit: "PIECE", minQty: 1, maxQty: 10 },
  { id: "g_4", name: "Socks (Pair)", unit: "PAIR", minQty: 1, maxQty: 20 },
  { id: "g_5", name: "Bulk Mixed Laundry", unit: "KG", minQty: 3, maxQty: 30 },
]

export default function GarmentTypesPage() {
  const [garments, setGarments] = useState(MOCK_GARMENTS)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  
  // Form State
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("PIECE")
  const [minQty, setMinQty] = useState("1")
  const [maxQty, setMaxQty] = useState("50")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    const newGarment = {
      id: `g_${Date.now()}`,
      name,
      unit,
      minQty: Number(minQty),
      maxQty: Number(maxQty),
    }
    setGarments((prev) => [...prev, newGarment])
    toast.success(`Garment type '${name}' created successfully.`)
    setIsOpen(false)
    setName("")
    setUnit("PIECE")
    setMinQty("1")
    setMaxQty("50")
  }

  const handleDelete = (id: string, name: string) => {
    setGarments((prev) => prev.filter((g) => g.id !== id))
    toast.error(`Garment type '${name}' has been deleted.`)
  }

  const filteredGarments = garments.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garment Types"
        subtitle="Manage the global list of customer-owned garments and measurement units"
      >
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Garment Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Garment Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Garment Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Silk Saree, Leather Jacket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="unit">Measurement Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIECE">PIECE (per article)</SelectItem>
                      <SelectItem value="PAIR">PAIR (socks, gloves etc.)</SelectItem>
                      <SelectItem value="KG">KG (weight basis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="min">Min Quantity</Label>
                    <Input
                      id="min"
                      type="number"
                      value={minQty}
                      onChange={(e) => setMinQty(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="max">Max Quantity</Label>
                    <Input
                      id="max"
                      type="number"
                      value={maxQty}
                      onChange={(e) => setMaxQty(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Type</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search garments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Garment Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-center">Min Order Bound</TableHead>
              <TableHead className="text-center">Max Order Bound</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGarments.map((garment) => (
              <TableRow key={garment.id} className="hover:bg-muted/10">
                <TableCell className="font-semibold text-sm">{garment.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
                    {garment.unit}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-sm">{garment.minQty}</TableCell>
                <TableCell className="text-center text-sm">{garment.maxQty}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-brand-500 hover:text-brand-600">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger hover:text-danger/80"
                      onClick={() => handleDelete(garment.id, garment.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
