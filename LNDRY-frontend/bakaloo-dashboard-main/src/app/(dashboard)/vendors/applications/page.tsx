"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X, Search, FileText, ChevronRight } from "lucide-react"
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
import { toast } from "sonner"

// Mock pending applications
const MOCK_APPLICATIONS = [
  {
    id: "app_1",
    name: "Clean & Fresh Drycleaners",
    owner: "Suresh Gupta",
    phone: "+91 99999 88888",
    email: "suresh@cleanfresh.com",
    city: "Mumbai",
    submittedAt: "2026-06-25T10:30:00Z",
    documents: ["GSTIN.pdf", "Shop_License.pdf"],
  },
  {
    id: "app_2",
    name: "Luxe Fabric Care",
    owner: "Meera Nair",
    phone: "+91 88888 77777",
    email: "meera@luxefabric.in",
    city: "Bengaluru",
    submittedAt: "2026-06-26T14:15:00Z",
    documents: ["Aadhar_Card.pdf", "Utility_Bill.pdf", "GSTIN.pdf"],
  },
  {
    id: "app_3",
    name: "QuickPress Laundry",
    owner: "Aniket Verma",
    phone: "+91 77777 66666",
    email: "aniket@quickpress.com",
    city: "Delhi",
    submittedAt: "2026-06-28T09:00:00Z",
    documents: ["Shop_License.pdf"],
  },
]

export default function VendorApplicationsPage() {
  const [applications, setApplications] = useState(MOCK_APPLICATIONS)
  const [search, setSearch] = useState("")

  const handleApprove = (id: string, name: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
    toast.success(`Application for '${name}' has been approved successfully.`)
  }

  const handleReject = (id: string, name: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
    toast.error(`Application for '${name}' has been rejected.`)
  }

  const filteredApps = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.owner.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Applications"
        subtitle="Review onboarding documents, KYC credentials, and approve new laundry vendor tenants"
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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
              <TableHead>Shop Details</TableHead>
              <TableHead>Owner Details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Documents Uploaded</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead className="text-right">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground text-sm">
                  No pending vendor applications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/10">
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm">{app.owner}</p>
                      <p className="text-xs text-muted-foreground">{app.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{app.city}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {app.documents.map((doc, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 font-normal">
                          <FileText className="h-3 w-3 text-brand-500" /> {doc}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-success hover:bg-success-bg hover:text-success border-success/30"
                        onClick={() => handleApprove(app.id, app.name)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger hover:bg-danger-bg hover:text-danger border-danger/30"
                        onClick={() => handleReject(app.id, app.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Link href={`/vendors/applications/${app.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-brand-500 gap-1 pl-2">
                          Review <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
