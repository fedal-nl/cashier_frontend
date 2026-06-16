import {
  Table,
  Form,
} from "react-bootstrap"
import { Link } from "react-router-dom"

import { formatCurrency } from "../utils/formatters"
import { ORDER_STATUS_LABELS } from "../constants/orderstatus"

export type Order = {
  id: string
  customer: {
    name: string
  }
  branch?: {
    id: number
    name: string
    location?: string
    is_active: boolean
  } | null
  total_price: number | string
  status: string
  created_at: string
  updated_at: string
}

type Props = {
  orders: Order[]
  onStatusChange: (
    id: string,
    status: string
  ) => void
}

export default function OrdersTable({
  orders,
  onStatusChange,
}: Props) {
  return (
    <Table
      striped
      bordered
      hover
      responsive
    >
      <thead>
        <tr>
          <th>#</th>
          <th>الزبون</th>
          <th>الفرع</th>
          <th>وقت الإنشاء</th>
          <th>وقت التحديث</th>
          <th>المبلغ</th>
          <th>الحالة</th>
          <th>التفاصيل</th>
        </tr>
      </thead>

      <tbody>
        {orders.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="text-center text-muted py-4"
            >
              لا توجد طلبات للعرض
            </td>
          </tr>
        )}

        {orders.map((order) => (
          <tr key={order.id}>
            <td>
              {order.id.slice(
                0,
                8
              )}
            </td>

            <td>
              {
                order.customer
                  .name
              }
            </td>

            <td>
              {order.branch?.name ?? "-"}
            </td>

            <td>
              {new Date(
                order.created_at
              ).toLocaleString(
                "ar-IQ"
              )}
            </td>

            <td>
              {new Date(
                order.updated_at
              ).toLocaleString(
                "ar-IQ"
              )}
            </td>

            <td>
              {formatCurrency(
                Number(
                  order.total_price
                )
              )}
            </td>

            <td
              style={{
                minWidth: "180px",
              }}
            >
              <Form.Select
                size="sm"
                value={
                  order.status
                }
                onChange={(e) =>
                  onStatusChange(
                    order.id,
                    e.target.value
                  )
                }
              >
                {Object.entries(
                  ORDER_STATUS_LABELS
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </Form.Select>
            </td>

            <td>
              <Link
                to={`/orders/${order.id}`}
                className="btn btn-sm btn-outline-primary"
              >
                طباعة
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
