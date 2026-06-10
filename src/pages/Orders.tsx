import {
  useEffect,
  useState,
} from "react"

import {
  Alert,
  Button,
  Container,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap"

import OrdersTable from "../components/OrdersTable"
import type { Order } from "../components/OrdersTable"
import { ORDER_STATUS_LABELS } from "../constants/orderstatus"

import {
  fetchDeliveryCompanies,
  fetchOrders,
  type DeliveryCompany,
  updateOrderStatus,
} from "../services/orders"

type PendingStatusChange = {
  orderId: string
  currentStatus: string
  nextStatus: string
}

export default function Orders() {
  const [orders, setOrders] =
    useState<Order[]>([])

  const [search, setSearch] =
    useState("")

  const [
    deliveryCompanies,
    setDeliveryCompanies,
  ] = useState<DeliveryCompany[]>([])

  const [
    selectedDeliveryCompanyId,
    setSelectedDeliveryCompanyId,
  ] = useState("")

  const [
    pendingStatusChange,
    setPendingStatusChange,
  ] = useState<PendingStatusChange | null>(
    null
  )

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  async function loadOrders() {
    const data =
      await fetchOrders(
        search
      )

    setOrders(data)
  }

  useEffect(() => {
    loadOrders()
    fetchDeliveryCompanies()
      .then(setDeliveryCompanies)
      .catch((err) => {
        console.error(err)
      })
  }, [])

  async function handleStatusChange(
    id: string,
    status: string
  ) {
    const order = orders.find(
      (item) => item.id === id
    )

    if (
      !order ||
      order.status === status
    ) {
      return
    }

    setMessage(null)
    setError(null)
    setPendingStatusChange({
      orderId: id,
      currentStatus: order.status,
      nextStatus: status,
    })
    setSelectedDeliveryCompanyId("")
  }

  function closeStatusDialog() {
    if (updatingStatus) {
      return
    }

    setPendingStatusChange(null)
    setSelectedDeliveryCompanyId("")
  }

  async function confirmStatusChange() {
    if (!pendingStatusChange) {
      return
    }

    setUpdatingStatus(true)
    setMessage(null)
    setError(null)

    try {
      const payload = {
        status:
          pendingStatusChange.nextStatus,
        ...(selectedDeliveryCompanyId && {
          delivery_company_id: Number(
            selectedDeliveryCompanyId
          ),
        }),
      }

      await updateOrderStatus(
        pendingStatusChange.orderId,
        payload
      )

      setMessage(
        "تم تحديث حالة الطلب بنجاح"
      )
      setPendingStatusChange(null)
      setSelectedDeliveryCompanyId("")
      await loadOrders()
    } catch (err) {
      console.error(err)
      setError(
        "تعذر تحديث حالة الطلب"
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  function getStatusLabel(
    status: string
  ) {
    return (
      ORDER_STATUS_LABELS[
        status as keyof typeof ORDER_STATUS_LABELS
      ] ?? status
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        الطلبات
      </h2>

      {message && (
        <Alert
          variant="success"
          onClose={() => setMessage(null)}
          dismissible
        >
          {message}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
        >
          {error}
        </Alert>
      )}

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

      <Modal
        show={Boolean(
          pendingStatusChange
        )}
        onHide={closeStatusDialog}
        centered
        dir="rtl"
      >
        <Modal.Header>
          <Modal.Title>
            تأكيد تغيير الحالة
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {pendingStatusChange && (
            <>
              <p className="mb-3">
                هل تريد تغيير حالة الطلب{" "}
                <strong>
                  {pendingStatusChange.orderId.slice(
                    0,
                    8
                  )}
                </strong>
                ؟
              </p>

              <div className="d-flex gap-2 justify-content-center">
                <span className="badge bg-secondary">
                  {getStatusLabel(
                    pendingStatusChange.currentStatus
                  )}
                </span>
                <span>
                  ←
                </span>
                <span className="badge bg-primary">
                  {getStatusLabel(
                    pendingStatusChange.nextStatus
                  )}
                </span>
              </div>

              <Form.Group className="mt-4">
                <Form.Label>
                  شركة التوصيل
                </Form.Label>

                <Form.Select
                  value={
                    selectedDeliveryCompanyId
                  }
                  onChange={(event) =>
                    setSelectedDeliveryCompanyId(
                      event.target.value
                    )
                  }
                  disabled={updatingStatus}
                >
                  <option value="">
                    بدون تغيير
                  </option>

                  {deliveryCompanies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name ||
                          `شركة رقم ${company.id}`}
                      </option>
                    )
                  )}
                </Form.Select>

                {deliveryCompanies.length ===
                  0 && (
                  <div className="text-muted small mt-2">
                    لا توجد شركات توصيل متاحة
                  </div>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={closeStatusDialog}
            disabled={updatingStatus}
          >
            إلغاء
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={confirmStatusChange}
            disabled={
              updatingStatus
            }
          >
            {updatingStatus ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="ms-2"
                />
                جار التحديث
              </>
            ) : (
              "تأكيد التغيير"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
