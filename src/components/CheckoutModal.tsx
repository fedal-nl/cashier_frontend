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

export type CheckoutCustomer =
  | { customer_id: number }
  | CustomerPayload

type Props = {
  show: boolean
  onClose: () => void
  onSubmit: (
    customer: CheckoutCustomer
  ) => void
}

export default function CheckoutModal({
  show,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [address, setAddress] =
    useState("")

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
      onSubmit({
        customer_id:
          selectedCustomer.id,
      })
      handleClose()
      return
    }

    if (!name.trim()) {
      setError("اسم العميل مطلوب")
      return
    }

    onSubmit({
      name: name.trim(),
      phone_number:
        phone.trim() || undefined,
      address:
        address.trim() || undefined,
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
      <Modal.Header closeButton>
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

          <Form.Group>
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
