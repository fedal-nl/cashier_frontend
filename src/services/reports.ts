import api from "./api"

export type DailyReportRow = {
  date: string
  total_orders: number
  orders_by_status: Record<string, number>
  total_existing_customers_ordered: number
  total_new_customers_ordered: number
  total_revenue: string
}

export async function fetchDailyReports(
  dateFrom: string,
  dateTo: string,
  filters: {
    branchId?: string
    status?: string
  } = {}
) {
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
  })

  if (filters.branchId) {
    params.append("branch_id", filters.branchId)
  }

  if (filters.status) {
    params.append("status", filters.status)
  }

  const response = await api.get<DailyReportRow[]>(
    `/reports/daily/?${params.toString()}`
  )

  return response.data
}
