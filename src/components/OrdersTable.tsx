import {
  Table,
  Form,
} from "react-bootstrap"

import { formatCurrency } from "../utils/formatters"

type Order = {
  id: string
  customer: {
    name: string
  }
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

const ORDER_STATUSES = {
  created: "تم الإنشاء",
  preparing: "قيد التحضير",
  ready: "جاهز للاستلام",
  completed: "مكتمل",
  cancelled: "ملغي",
  paid: "مدفوع",
  picked_up: "تم الاستلام",
  delivered: "تم التوصيل",
}

export default function OrdersTable({
  orders,
  onStatusChange,
}: Props) {
    console.log("Rendering OrdersTable with orders:", orders)
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
                  ORDER_STATUSES
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