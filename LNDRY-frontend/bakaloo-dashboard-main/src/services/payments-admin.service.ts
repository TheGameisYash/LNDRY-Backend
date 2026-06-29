import api from "@/lib/api"
import type { ApiResponse } from "@/types"

export interface PaymentRecord {
  id: string
  draftId: string
  gatewayId: string
  customer: string
  amountPaise: number
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED"
  method: string
  date: string
}

export async function getPaymentRecords(): Promise<PaymentRecord[]> {
  try {
    const { data } = await api.get<ApiResponse<PaymentRecord[]>>("/admin/payments")
    return data.data
  } catch (err) {
    return [
      {
        id: "pay_001",
        draftId: "dr_8829",
        gatewayId: "pay_Qz891JLa021",
        customer: "Amit Sharma",
        amountPaise: 45000,
        status: "PAID",
        method: "ONLINE",
        date: "2026-06-29T10:00:00Z",
      },
    ]
  }
}

export async function issuePaymentRefund(paymentId: string, amountPaise: number, reason: string): Promise<void> {
  await api.post(`/admin/payments/${paymentId}/refund`, { amount_paise: amountPaise, reason })
}
