"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, ShieldCheck, ShieldAlert, Edit } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock Vendors Data matching the LNDRY design rules
const MOCK_VENDORS = [
  {
    id: "v_1",
    name: "Spin Cycle Premium Care",
    owner: "Amit Sharma",
    phone: "+91 98765 43210",
    radius: "5.5 km",
    services: 8,
    published: true,
    enabled: true,
    status: "APPROVED",
  },
  {
    id: "v_2",
    name: "BrightWash Drycleaners",
    owner: "Priyanka Patel",
    phone: "+91 87654 32109",
    radius: "4.0 km",
    services: 12,
    published: true,
    enabled: true,
    status: "APPROVED",
  },
  {
    id: "v_3",
    name: "EcoLaundry Solutions",
    owner: "Rohan Das",
    phone: "+91 76543 21098",
    radius: "6.0 km",
    services: 6,
    published: false,
    enabled: true,
    status: "APPROVED",
  },
  {
    id: "v_4",
    name: "Express Pressing & Tailors",
    owner: "Vikram Singh",
    phone: "+91 65432 10987",
    radius: "3.5 km",
    services: 4,
    published: true,
    enabled: false,
    status: "SUSPENDED",
  },
]

export default function VendorsPage() {
  const [search, setSearch] = useState("")

  const filteredVendors = MOCK_VENDORS.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.owner.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Vendors"
        subtitle="Manage approved laundry partners, radius bounds, and publication states"
      >
        <Link href="/vendors/applications">
          <Button className="bg-brand-500 hover:bg-brand-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Review Applications
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendor name, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1.5" />
          Filters
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Vendor Shop</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Effective Radius</TableHead>
              <TableHead className="text-center">Active Services</TableHead>
              <TableHead>Marketplace status</TableHead>
              <TableHead>System status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id} className="hover:bg-muted/10">
                <TableCell className="font-semibold text-sm">
                  <div>
                    <p className="text-sm font-semibold">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{vendor.owner}</TableCell>
                <TableCell className="text-sm">{vendor.radius}</TableCell>
                <TableCell className="text-center text-sm">{vendor.services}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 border-0 font-medium ${
                      vendor.published
                        ? "bg-info-bg text-info"
                        : "bg-danger-bg text-danger"
                    }`}
                  >
                    {vendor.published ? "Published" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 border-0 font-medium ${
                      vendor.enabled
                        ? "bg-success-bg text-success"
                        : "bg-danger-bg text-danger"
                    }`}
                  >
                    {vendor.enabled ? (
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Suspended
                      </span>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/vendors/${vendor.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-brand-500 hover:text-brand-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
