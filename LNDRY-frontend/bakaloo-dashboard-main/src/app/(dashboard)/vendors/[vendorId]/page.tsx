"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Store, Users, Clock, Settings, FileText, CheckCircle } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function VendorDetailPage({ params }: { params: { vendorId: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("services")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground pl-1">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to list
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 p-2.5">
            <Store className="h-full w-full text-brand-500 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Spin Cycle Premium Care</h1>
            <p className="text-sm text-muted-foreground">ID: {params.vendorId} · Mumbai West</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-success-bg text-success border-0 px-2.5 py-0.5">APPROVED</Badge>
          <Badge className="bg-info-bg text-info border-0 px-2.5 py-0.5">PUBLISHED</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-10 w-full justify-start overflow-x-auto flex-nowrap border-b bg-transparent p-0 rounded-none">
          <TabsTrigger value="services" className="text-sm px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:bg-transparent data-[state=active]:text-brand-500 font-semibold">
            Services & Rates
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-sm px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:bg-transparent data-[state=active]:text-brand-500 font-semibold">
            Employees
          </TabsTrigger>
          <TabsTrigger value="slots" className="text-sm px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:bg-transparent data-[state=active]:text-brand-500 font-semibold">
            Capacity & Slots
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-sm px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:bg-transparent data-[state=active]:text-brand-500 font-semibold">
            KYC Documents
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Catalogs & Garment Rates</CardTitle>
                <CardDescription>Configure prices in integer paise for each garment type under this vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Garment Type</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Rate (Paise)</TableHead>
                      <TableHead className="text-right">Rate (Rupees)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Premium Dry Cleaning</TableCell>
                      <TableCell>Silk Saree</TableCell>
                      <TableCell>PIECE</TableCell>
                      <TableCell className="text-right">25000</TableCell>
                      <TableCell className="text-right font-semibold">₹250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Premium Dry Cleaning</TableCell>
                      <TableCell>Men's Suit (2pc)</TableCell>
                      <TableCell>PAIR</TableCell>
                      <TableCell className="text-right">35000</TableCell>
                      <TableCell className="text-right font-semibold">₹350.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Wash & Fold</TableCell>
                      <TableCell>Daily Wear</TableCell>
                      <TableCell>KG</TableCell>
                      <TableCell className="text-right">9900</TableCell>
                      <TableCell className="text-right font-semibold">₹99.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Riders & Staff Assignments</CardTitle>
                <CardDescription>Active delivery executives and internal workspace employees</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Workload</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Rahul Varma</TableCell>
                      <TableCell>+91 98765 00001 · rahul@spincycle.com</TableCell>
                      <TableCell>RIDER / DELIVERY</TableCell>
                      <TableCell>2 active jobs</TableCell>
                      <TableCell>
                        <Badge className="bg-success-bg text-success border-0 px-2 py-0.5">ONLINE</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Karan Johar</TableCell>
                      <TableCell>+91 98765 00002 · karan@spincycle.com</TableCell>
                      <TableCell>SHOP_STAFF</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <Badge className="bg-success-bg text-success border-0 px-2 py-0.5">ONLINE</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Slot Definition & Hourly Capacity</CardTitle>
                <CardDescription>Recurring 60-minute pickup and delivery windows</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time Window</TableHead>
                      <TableHead className="text-center">Max Orders</TableHead>
                      <TableHead className="text-center">Active Holds</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Monday - Saturday</TableCell>
                      <TableCell>09:00 AM - 10:00 AM</TableCell>
                      <TableCell className="text-center">15</TableCell>
                      <TableCell className="text-center font-semibold text-brand-500">3</TableCell>
                      <TableCell>
                        <Badge className="bg-success-bg text-success border-0 px-2 py-0.5">ACTIVE</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Monday - Saturday</TableCell>
                      <TableCell>10:00 AM - 11:00 AM</TableCell>
                      <TableCell className="text-center">15</TableCell>
                      <TableCell className="text-center font-semibold text-brand-500">8</TableCell>
                      <TableCell>
                        <Badge className="bg-success-bg text-success border-0 px-2 py-0.5">ACTIVE</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Documents</CardTitle>
                <CardDescription>KYC verification and license attachments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-brand-500" />
                      <div>
                        <p className="text-sm font-semibold">GSTIN Certificate</p>
                        <p className="text-xs text-muted-foreground">GSTIN_SpinCycle_2026.pdf · 1.2 MB</p>
                      </div>
                    </div>
                    <Badge className="bg-success-bg text-success border-0 gap-1"><CheckCircle className="h-3 w-3" /> VERIFIED</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-brand-500" />
                      <div>
                        <p className="text-sm font-semibold">Shop License Act 1948</p>
                        <p className="text-xs text-muted-foreground">ShopAct_2209.pdf · 2.4 MB</p>
                      </div>
                    </div>
                    <Badge className="bg-success-bg text-success border-0 gap-1"><CheckCircle className="h-3 w-3" /> VERIFIED</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
