import {
  useState,
} from "react"
import {
  Modal,
  Button,
  Form,
  Alert,
  Card,
  InputGroup,
  Spinner,
} from "react-bootstrap"
import {
  findCustomer,
  type Customer,
  type CustomerPayload,
} from "../services/customers"
import type { DeliveryCompany } from "../services/orders"

export type CheckoutCustomer =
  | { customer_id: number }
  | CustomerPayload

export type CheckoutData = {
  customer: CheckoutCustomer
  delivery_company_id: number
  orderNote?: string
}

type Props = {
  show: boolean
  deliveryCompanies: DeliveryCompany[]
  onClose: () => void
  onSubmit: (
    data: CheckoutData
  ) => void
}

export default function CheckoutModal({
  show,
  deliveryCompanies,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [address, setAddress] =
    useState("")

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

  function resetForm() {
    setName("")
    setPhone("")
    setAddress("")
    setOrderNote("")
    setSelectedDeliveryCompanyId("")
    setSelectedCustomer(null)
    setSearched(false)
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
      const result =
        await findCustomer(
          phone.trim()
        )

      if (result.exists) {
        const customer =
          result.customer as Customer

        setSelectedCustomer(customer)
        setName(
          customer.name
        )
        setAddress(
          customer.address || ""
        )
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

  function handlePhoneChange(
    value: string
  ) {
    setPhone(value)
    setSelectedCustomer(null)
    setSearched(false)
    setError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (selectedCustomer) {
      if (!selectedDeliveryCompanyId) {
        setError("اختر شركة التوصيل")
        return
      }

      onSubmit({
        customer: {
          customer_id:
            selectedCustomer.id,
        },
        delivery_company_id: Number(
          selectedDeliveryCompanyId
        ),
        orderNote:
          orderNote.trim() || undefined,
      })
      handleClose()
      return
    }

    if (!name.trim()) {
      setError("اسم العميل مطلوب")
      return
    }

    if (!selectedDeliveryCompanyId) {
      setError("اختر شركة التوصيل")
      return
    }

    onSubmit({
      customer: {
        name: name.trim(),
        phone_number:
          phone.trim() || undefined,
        address:
          address.trim() || undefined,
      },
      delivery_company_id: Number(
        selectedDeliveryCompanyId
      ),
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
          بيانات الزبون
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {selectedCustomer && (
          <Alert variant="success">
            تم اختيار عميل موجود لهذا الطلب
          </Alert>
        )}

          <Form.Group className="mb-3">
            <Form.Label>
              رقم الهاتف
            </Form.Label>

            <InputGroup>
              <Form.Control
                value={phone}
                onChange={(e) =>
                  handlePhoneChange(
                    e.target.value
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
            </Form.Label>

            <Form.Control
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
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
            </Form.Label>

            <Form.Control
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              disabled={Boolean(
                selectedCustomer
              )}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              شركة التوصيل
            </Form.Label>

            <Form.Select
              value={selectedDeliveryCompanyId}
              onChange={(e) =>
                setSelectedDeliveryCompanyId(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                اختر شركة التوصيل
              </option>

              {deliveryCompanies.map((company) => (
                <option
                  key={company.id}
                  value={company.id}
                >
                  {company.name ||
                    `شركة رقم ${company.id}`}
                </option>
              ))}
            </Form.Select>

            {deliveryCompanies.length === 0 && (
              <div className="text-muted small mt-2">
                لا توجد شركات توصيل متاحة
              </div>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>
              ملاحظة عامة للطلب
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              value={orderNote}
              onChange={(e) =>
                setOrderNote(
                  e.target.value
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
          {selectedCustomer
            ? "اختيار وإنشاء الطلب"
            : "إنشاء العميل والطلب"}
        </Button>
      </Modal.Footer>
      </Form>
    </Modal>
  )
}
