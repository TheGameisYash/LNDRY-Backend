"use client"

import { useState } from "react"
import { Calendar, Plus, Clock, AlertTriangle, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

const MOCK_RECURRING_SLOTS = [
  { id: "s_1", start: "08:00 AM", end: "09:00 AM", capacity: 10, day: "Everyday", status: "ACTIVE" },
  { id: "s_2", start: "09:00 AM", end: "10:00 AM", capacity: 15, day: "Everyday", status: "ACTIVE" },
  { id: "s_3", start: "10:00 AM", end: "11:00 AM", capacity: 15, day: "Everyday", status: "ACTIVE" },
  { id: "s_4", start: "11:00 AM", end: "12:00 PM", capacity: 10, day: "Everyday", status: "ACTIVE" },
  { id: "s_5", start: "04:00 PM", end: "05:00 PM", capacity: 12, day: "Everyday", status: "ACTIVE" },
  { id: "s_6", start: "05:00 PM", end: "06:00 PM", capacity: 15, day: "Everyday", status: "ACTIVE" },
]

const MOCK_EXCEPTIONS = [
  { id: "exc_1", date: "2026-07-02", start: "09:00 AM", end: "10:00 AM", reason: "Maintenance shut down", overrideCapacity: 0, status: "ENFORCED" },
  { id: "exc_2", date: "2026-07-05", start: "10:00 AM", end: "11:00 AM", reason: "Festival holiday peak load", overrideCapacity: 25, status: "ENFORCED" },
]

export default function CapacityPage() {
  const [exceptions, setExceptions] = useState(MOCK_EXCEPTIONS)

  const handleAddException = () => {
    const newExc = {
      id: `exc_${Date.now()}`,
      date: "2026-07-10",
      start: "08:00 AM",
      end: "09:00 AM",
      reason: "Staff shortage override",
      overrideCapacity: 2,
      status: "ENFORCED",
    }
    setExceptions((prev) => [...prev, newExc])
    toast.success("Dated capacity exception override added successfully.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacity & Slot Definitions"
        subtitle="Manage 60-minute recurring booking windows and audit dated capacity overrides"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recurring 60-minute Windows</CardTitle>
                <CardDescription>Standard daily operational slots</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-brand-500" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-center">Capacity (Orders/Hr)</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_RECURRING_SLOTS.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-semibold text-sm">
                        {slot.start} - {slot.end}
                      </TableCell>
                      <TableCell className="text-sm">{slot.day}</TableCell>
                      <TableCell className="text-center text-sm font-semibold text-brand-500">
                        {slot.capacity}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-success-bg text-success border-0 px-2 py-0.5">
                          {slot.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Dated Exceptions</CardTitle>
                <CardDescription>Overrides to normal limits</CardDescription>
              </div>
              <Button size="sm" onClick={handleAddException} className="h-8">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {exceptions.map((exc) => (
                <div key={exc.id} className="p-3 border rounded-xl space-y-2 bg-muted/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-1 bg-amber-500" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-brand-500" /> {exc.date}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-amber-50/50 text-amber-600 border-amber-200">
                      {exc.overrideCapacity} orders max
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold">
                    {exc.start} - {exc.end}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    {exc.reason}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
