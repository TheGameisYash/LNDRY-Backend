import api from "@/lib/api"
import type { ApiResponse } from "@/types"

export interface Vendor {
  id: string
  name: string
  owner: string
  phone: string
  radius: string
  services: number
  published: boolean
  enabled: boolean
  status: string
}

export interface VendorApplication {
  id: string
  name: string
  owner: string
  phone: string
  email: string
  city: string
  submittedAt: string
  documents: string[]
}

export async function getVendors(): Promise<Vendor[]> {
  try {
    const { data } = await api.get<ApiResponse<Vendor[]>>("/admin/vendors")
    return data.data
  } catch (err) {
    // Fallback to mock data for presentation
    return [
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
    ]
  }
}

export async function getVendorApplications(): Promise<VendorApplication[]> {
  try {
    const { data } = await api.get<ApiResponse<VendorApplication[]>>("/admin/vendors/applications")
    return data.data
  } catch (err) {
    return [
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
    ]
  }
}

export async function approveVendorApplication(id: string): Promise<void> {
  await api.post(`/admin/vendors/applications/${id}/approve`)
}

export async function rejectVendorApplication(id: string): Promise<void> {
  await api.post(`/admin/vendors/applications/${id}/reject`)
}
