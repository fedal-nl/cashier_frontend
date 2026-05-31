import {
  Table,
  Button,
  Badge,
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
  function nextStatus(
    status: string
  ) {
    if (status === "created")
      return "preparing"

    if (status === "preparing")
      return "ready"

    if (status === "ready")
      return "delivered"

    return null
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>الزبون</th>
          <th>الوقت</th>
          <th>المبلغ</th>
          <th>الحالة</th>
          <th>إجراء</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => {
          const next =
            nextStatus(
              order.status
            )

          return (
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
                ).toLocaleTimeString(
                  "ar-IQ"
                )}
              </td>

              <td>
                {formatCurrency(
                  order.total_price
                )}
              </td>

              <td>
                <Badge bg="info">
                  {order.status}
                </Badge>
              </td>

              <td>
                {next && (
                  <Button
                    size="sm"
                    onClick={() =>
                      onStatusChange(
                        order.id,
                        next
                      )
                    }
                  >
                    تحديث
                  </Button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}