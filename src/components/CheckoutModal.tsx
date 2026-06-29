import { useState } from "react"
import {
  Alert,
  Button,
  Card,
  Form,
  InputGroup,
  Modal,
  Spinner,
} from "react-bootstrap"

import {
  findCustomer,
  type Customer,
  type CustomerPayload,
} from "../services/customers"
import type {
  DeliveryCompany,
  OrderType,
} from "../services/orders"

const DEFAULT_ORDER_TYPE = "dine_in"

export type CheckoutCustomer =
  | { customer_id: number }
  | CustomerPayload

export type CheckoutData = {
  order_type: string
  customer?: CheckoutCustomer
  delivery_company_id?: number
  orderNote?: string
}

type Props = {
  show: boolean
  deliveryCompanies: DeliveryCompany[]
  orderTypes: OrderType[]
  onClose: () => void
  onSubmit: (data: CheckoutData) => void
}

export default function CheckoutModal({
  show,
  deliveryCompanies,
  orderTypes,
  onClose,
  onSubmit,
}: Props) {
  const [selectedOrderType, setSelectedOrderType] =
    useState(DEFAULT_ORDER_TYPE)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [orderNote, setOrderNote] =
    useState("")

  const [
    selectedDeliveryCompanyId,
    setSelectedDeliveryCompanyId,
  ] = useState("")

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(null)

  const [searched, setSearched] =
    useState(false)
  const [searching, setSearching] =
    useState(false)
  const [error, setError] =
    useState<string | null>(null)

  const isDelivery =
    selectedOrderType === "delivery"
  const allowsCustomer =
    selectedOrderType !== "dine_in"

  function resetCustomerFields() {
    setName("")
    setPhone("")
    setAddress("")
    setSelectedCustomer(null)
    setSearched(false)
  }

  function resetForm() {
    resetCustomerFields()
    setOrderNote("")
    setSelectedOrderType(DEFAULT_ORDER_TYPE)
    setSelectedDeliveryCompanyId("")
    setSearching(false)
    setError(null)
  }

  async function handleCustomerSearch() {
    if (!phone.trim()) {
      setError("أدخل رقم الهاتف أولا")
      return
    }

    setSearching(true)
    setSearched(false)
    setError(null)

    try {
      const result = await findCustomer(
        phone.trim()
      )

      if (result.exists) {
        const customer =
          result.customer as Customer

        setSelectedCustomer(customer)
        setName(customer.name)
        setAddress(customer.address || "")
      } else {
        setSelectedCustomer(null)
      }

      setSearched(true)
    } catch (error) {
      console.error(error)
      setError("تعذر البحث عن العميل")
    } finally {
      setSearching(false)
    }
  }

  function handlePhoneChange(value: string) {
    setPhone(value)
    setSelectedCustomer(null)
    setSearched(false)
    setError(null)
  }

  function handleOrderTypeChange(value: string) {
    setSelectedOrderType(value)
    setError(null)

    if (value !== "delivery") {
      setSelectedDeliveryCompanyId("")
    }

    if (value === "dine_in") {
      resetCustomerFields()
    }
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (
      isDelivery &&
      !selectedDeliveryCompanyId
    ) {
      setError("اختر شركة التوصيل")
      return
    }

    if (isDelivery && !phone.trim()) {
      setError("رقم الهاتف مطلوب")
      return
    }

    if (selectedCustomer) {
      onSubmit({
        order_type: selectedOrderType,
        customer: {
          customer_id:
            selectedCustomer.id,
        },
        ...(isDelivery && {
          delivery_company_id: Number(
            selectedDeliveryCompanyId
          ),
        }),
        orderNote:
          orderNote.trim() || undefined,
      })
      handleClose()
      return
    }

    if (isDelivery && !name.trim()) {
      setError("اسم العميل مطلوب")
      return
    }

    if (isDelivery && !address.trim()) {
      setError("عنوان العميل مطلوب")
      return
    }

    onSubmit({
      order_type: selectedOrderType,
      ...(allowsCustomer &&
        name.trim() && {
          customer: {
            name: name.trim(),
            phone_number:
              phone.trim() || undefined,
            address:
              address.trim() || undefined,
          },
        }),
      ...(isDelivery && {
        delivery_company_id: Number(
          selectedDeliveryCompanyId
        ),
      }),
      orderNote:
        orderNote.trim() || undefined,
    })

    handleClose()
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dir="rtl"
      centered
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>
            بيانات الطلب
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              نوع الطلب
            </Form.Label>
            <Form.Select
              value={selectedOrderType}
              onChange={(event) =>
                handleOrderTypeChange(
                  event.target.value
                )
              }
              required
            >
              {orderTypes.map((orderType) => (
                <option
                  key={orderType.value}
                  value={orderType.value}
                >
                  {orderType.label_ar}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {allowsCustomer && (
            <>
              {selectedCustomer && (
                <Alert variant="success">
                  تم اختيار عميل موجود لهذا الطلب
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>
                  رقم الهاتف
                  {isDelivery && (
                    <span className="text-danger">
                      {" "}
                      *
                    </span>
                  )}
                </Form.Label>

                <InputGroup>
                  <Form.Control
                    value={phone}
                    onChange={(event) =>
                      handlePhoneChange(
                        event.target.value
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline-primary"
                    onClick={
                      handleCustomerSearch
                    }
                    disabled={searching}
                  >
                    {searching ? (
                      <Spinner
                        animation="border"
                        size="sm"
                      />
                    ) : (
                      "بحث"
                    )}
                  </Button>
                </InputGroup>
              </Form.Group>

              {selectedCustomer && (
                <Card className="mb-3 text-end">
                  <Card.Body>
                    <Card.Title className="mb-2">
                      {selectedCustomer.name}
                    </Card.Title>
                    <div className="text-muted small">
                      {selectedCustomer.phone_number ||
                        "بدون رقم هاتف"}
                    </div>
                    <div className="text-muted small">
                      {selectedCustomer.address ||
                        "بدون عنوان"}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {searched &&
                !selectedCustomer && (
                  <Alert variant="info">
                    لم يتم العثور على عميل بهذا الرقم، يمكنك إنشاء عميل جديد من نفس النموذج
                  </Alert>
                )}

              <Form.Group className="mb-3">
                <Form.Label>
                  الاسم
                  {isDelivery ? (
                    <span className="text-danger">
                      {" "}
                      *
                    </span>
                  ) : (
                    " (اختياري)"
                  )}
                </Form.Label>
                <Form.Control
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  disabled={Boolean(
                    selectedCustomer
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  العنوان
                  {isDelivery && (
                    <span className="text-danger">
                      {" "}
                      *
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  disabled={Boolean(
                    selectedCustomer
                  )}
                />
              </Form.Group>
            </>
          )}

          {isDelivery && (
            <Form.Group className="mb-3">
              <Form.Label>
                شركة التوصيل
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </Form.Label>

              <Form.Select
                value={selectedDeliveryCompanyId}
                onChange={(event) =>
                  setSelectedDeliveryCompanyId(
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  اختر شركة التوصيل
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

              {deliveryCompanies.length === 0 && (
                <div className="text-muted small mt-2">
                  لا توجد شركات توصيل متاحة
                </div>
              )}
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label>
              ملاحظة عامة للطلب
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              value={orderNote}
              onChange={(event) =>
                setOrderNote(
                  event.target.value
                )
              }
              placeholder="مثال: يرجى تجهيز الطلب بسرعة"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            إلغاء
          </Button>

          <Button
            variant="success"
            type="submit"
          >
            إنشاء الطلب
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
