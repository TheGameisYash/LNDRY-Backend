"use client"

import { useState } from "react"
import { Search, IndianRupee, ArrowUpRight, HelpCircle, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

const MOCK_PAYMENTS = [
  {
    id: "pay_001",
    draftId: "dr_8829",
    gatewayId: "pay_Qz891JLa021",
    customer: "Amit Sharma",
    amountPaise: 45000, // ₹450.00
    status: "PAID",
    method: "ONLINE",
    date: "2026-06-29T10:00:00Z",
  },
  {
    id: "pay_002",
    draftId: "dr_9921",
    gatewayId: "pay_Qz891JLa022",
    customer: "Priyanka Patel",
    amountPaise: 125000, // ₹1250.00
    status: "PAID",
    method: "ONLINE",
    date: "2026-06-29T11:15:00Z",
  },
  {
    id: "pay_003",
    draftId: "dr_1029",
    gatewayId: "pay_Qz891JLa023",
    customer: "Rohan Das",
    amountPaise: 75000, // ₹750.00
    status: "PENDING",
    method: "ONLINE",
    date: "2026-06-29T12:00:00Z",
  },
  {
    id: "pay_004",
    draftId: "dr_3321",
    gatewayId: "pay_Qz891JLa024",
    customer: "Suresh Gupta",
    amountPaise: 38000, // ₹380.00
    status: "REFUNDED",
    method: "MANUAL",
    date: "2026-06-28T16:30:00Z",
  },
]

export default function PaymentsPage() {
  const [search, setSearch] = useState("")

  const handleRefund = (id: string, amount: number) => {
    toast.success(`Refund of ₹${(amount / 100).toFixed(2)} has been queued.`)
  }

  const filteredPayments = MOCK_PAYMENTS.filter(
    (p) =>
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.gatewayId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Operations"
        subtitle="Track payment states, Razorpay references, and trigger auditable refunds"
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer, Gateway ID..."
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
              <TableHead>Gateway Reference</TableHead>
              <TableHead>Draft ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount (Paise)</TableHead>
              <TableHead>Amount (Rupees)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/10">
                <TableCell className="font-semibold text-sm">
                  <div className="flex items-center gap-1">
                    {p.gatewayId}
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">{p.draftId}</TableCell>
                <TableCell className="text-sm font-semibold">{p.customer}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.amountPaise}</TableCell>
                <TableCell className="text-sm font-bold">₹{(p.amountPaise / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 border-0 font-medium ${
                      p.status === "PAID"
                        ? "bg-success-bg text-success"
                        : p.status === "PENDING"
                        ? "bg-warning-bg text-warning"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-semibold">{p.method}</TableCell>
                <TableCell className="text-right">
                  {p.status === "PAID" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefund(p.id, p.amountPaise)}
                      className="text-danger hover:bg-danger-bg hover:text-danger border-danger/30 text-xs py-1 h-8"
                    >
                      Issue Refund
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
