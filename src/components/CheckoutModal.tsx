import { useState } from "react"
import {
  Modal,
  Button,
  Form,
  Alert,
} from "react-bootstrap"
import { findCustomer } from "../services/customers"

type Props = {
  show: boolean
  onClose: () => void
  onSubmit: (customer: {
    name: string
    phone_number?: string
    address?: string
  }) => void
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

  const [existingCustomer,
    setExistingCustomer] =
    useState(false)

  async function handlePhoneBlur() {
    if (!phone) return

    try {
      const result =
        await findCustomer(phone)

      if (result.exists) {
        setExistingCustomer(true)
        setName(
          result.customer.name
        )
        setAddress(
          result.customer.address || ""
        )
      } else {
        setExistingCustomer(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  function handleSubmit() {
    onSubmit({
      name,
      phone_number: phone,
      address,
    })

    onClose()
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          بيانات الزبون
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {existingCustomer && (
          <Alert variant="success">
            تم العثور على الزبون
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              رقم الهاتف
            </Form.Label>

            <Form.Control
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              onBlur={
                handlePhoneBlur
              }
            />
          </Form.Group>

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
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
        >
          إلغاء
        </Button>

        <Button
          variant="success"
          onClick={handleSubmit}
        >
          إنشاء الطلب
        </Button>
      </Modal.Footer>
    </Modal>
  )
}