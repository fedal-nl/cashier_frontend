import {
  useEffect,
  useState,
} from "react"

import {
  Container,
  Form,
} from "react-bootstrap"

import OrdersTable from "../components/OrdersTable"

import {
  fetchOrders,
  updateOrderStatus,
} from "../services/orders"

export default function Orders() {
  const [orders, setOrders] =
    useState([])

  const [search, setSearch] =
    useState("")

  async function loadOrders() {
    const data =
      await fetchOrders(
        search
      )

    setOrders(data)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function handleStatusChange(
    id: string,
    status: string
  ) {
    await updateOrderStatus(
      id,
      status
    )

    loadOrders()
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        الطلبات
      </h2>

      <Form.Control
        className="mb-3"
        placeholder="بحث برقم الطلب"
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        onKeyUp={loadOrders}
      />

      <OrdersTable
        orders={orders}
        onStatusChange={
          handleStatusChange
        }
      />
    </Container>
  )
}