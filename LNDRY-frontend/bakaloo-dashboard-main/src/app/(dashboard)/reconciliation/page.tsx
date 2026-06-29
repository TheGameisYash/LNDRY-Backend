"use client"

import { useState } from "react"
import { BarChart3, Receipt, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

const MOCK_RECON_ITEMS = [
  {
    id: "rec_001",
    orderId: "LNDRY-88219",
    vendor: "Spin Cycle Premium Care",
    estimatedPaise: 45000,
    confirmedPaise: 50000, // +₹50.00 delta
    deltaPaise: 5000,
    type: "CHARGE_CUSTOMER",
    status: "PENDING_CUSTOMER_ACTION",
  },
  {
    id: "rec_002",
    orderId: "LNDRY-99120",
    vendor: "BrightWash Drycleaners",
    estimatedPaise: 125000,
    confirmedPaise: 110000, // -₹150.00 delta (refund)
    deltaPaise: -15000,
    type: "REFUND_CUSTOMER",
    status: "SETTLED",
  },
  {
    id: "rec_003",
    orderId: "LNDRY-10291",
    vendor: "EcoLaundry Solutions",
    estimatedPaise: 75000,
    confirmedPaise: 75000, // exact
    deltaPaise: 0,
    type: "NONE",
    status: "SETTLED",
  },
]

export default function ReconciliationPage() {
  const [items, setItems] = useState(MOCK_RECON_ITEMS)

  const handleSettle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "SETTLED" } : item))
    )
    toast.success("Settlement transaction resolved and posted to vendor ledger.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Reconciliation"
        subtitle="Manage difference reports from customer estimates vs vendor physical garment checks"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Unreconciled Deltas</p>
            <p className="text-2xl font-bold font-display text-foreground mt-1">1 Pending</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-amber-500 bg-amber-50 rounded-xl p-1.5" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Adjusted Refunds</p>
            <p className="text-2xl font-bold font-display text-foreground mt-1">₹150.00</p>
          </div>
          <Receipt className="h-8 w-8 text-brand-500 bg-brand-50 rounded-xl p-1.5" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Ledger Health</p>
            <p className="text-2xl font-bold font-display text-foreground mt-1">100% Balanced</p>
          </div>
          <CheckCircle className="h-8 w-8 text-success bg-success-bg rounded-xl p-1.5" />
        </Card>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Order ID</TableHead>
              <TableHead>Vendor Shop</TableHead>
              <TableHead className="text-right">Estimated Estimate</TableHead>
              <TableHead className="text-right">Vendor Confirmed</TableHead>
              <TableHead className="text-right">Delta</TableHead>
              <TableHead>Settlement Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/10">
                <TableCell className="font-semibold text-sm">{item.orderId}</TableCell>
                <TableCell className="text-sm font-semibold">{item.vendor}</TableCell>
                <TableCell className="text-right text-sm">₹{(item.estimatedPaise / 100).toFixed(2)}</TableCell>
                <TableCell className="text-right text-sm">₹{(item.confirmedPaise / 100).toFixed(2)}</TableCell>
                <TableCell className={`text-right text-sm font-bold ${item.deltaPaise > 0 ? "text-danger" : item.deltaPaise < 0 ? "text-success" : "text-muted-foreground"}`}>
                  {item.deltaPaise > 0 ? `+₹${(item.deltaPaise / 100).toFixed(2)}` : item.deltaPaise < 0 ? `-₹${(Math.abs(item.deltaPaise) / 100).toFixed(2)}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 border-0 font-medium ${
                      item.status === "SETTLED"
                        ? "bg-success-bg text-success"
                        : "bg-warning-bg text-warning"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {item.status !== "SETTLED" ? (
                    <Button size="sm" onClick={() => handleSettle(item.id)} className="h-8 text-xs gap-1 pl-2">
                      <RefreshCw className="h-3 w-3 animate-spin-slow" /> Resolve Delta
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
