import { useState } from "react"
import {
  Modal,
  Button,
  Form,
} from "react-bootstrap"

type Props = {
  show: boolean
  onClose: () => void
  onSubmit: (
    name: string,
    phone: string,
    address: string
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

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          بيانات الزبون
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
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

        <Form.Group className="mb-3">
          <Form.Label>
            الهاتف
          </Form.Label>
          <Form.Control
            value={phone}
            onChange={(e) =>
              setPhone(
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
          onClick={() =>
            onSubmit(
              name,
              phone,
              address
            )
          }
        >
          تأكيد الطلب
        </Button>
      </Modal.Footer>
    </Modal>
  )
}