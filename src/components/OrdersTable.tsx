import {
  Table,
  Form,
} from "react-bootstrap"

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
  total_price: number
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
        </tr>
      </thead>

      <tbody>
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
                order.total_price
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
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
