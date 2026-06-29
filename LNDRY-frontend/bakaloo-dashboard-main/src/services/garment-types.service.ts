import api from "@/lib/api"
import type { ApiResponse } from "@/types"

export interface GarmentType {
  id: string
  name: string
  unit: "PIECE" | "PAIR" | "KG"
  minQty: number
  maxQty: number
}

export async function getGarmentTypes(): Promise<GarmentType[]> {
  try {
    const { data } = await api.get<ApiResponse<GarmentType[]>>("/admin/garments")
    return data.data
  } catch (err) {
    return [
      { id: "g_1", name: "Shirt / T-Shirt", unit: "PIECE", minQty: 1, maxQty: 50 },
      { id: "g_2", name: "Trousers / Jeans", unit: "PIECE", minQty: 1, maxQty: 50 },
      { id: "g_3", name: "Bed Sheet (Double)", unit: "PIECE", minQty: 1, maxQty: 10 },
      { id: "g_4", name: "Socks (Pair)", unit: "PAIR", minQty: 1, maxQty: 20 },
      { id: "g_5", name: "Bulk Mixed Laundry", unit: "KG", minQty: 3, maxQty: 30 },
    ]
  }
}

export async function createGarmentType(payload: Omit<GarmentType, "id">): Promise<GarmentType> {
  const { data } = await api.post<ApiResponse<GarmentType>>("/admin/garments", payload)
  return data.data
}

export async function deleteGarmentType(id: string): Promise<void> {
  await api.delete(`/admin/garments/${id}`)
}
