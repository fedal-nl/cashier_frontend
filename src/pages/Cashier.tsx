import { useEffect, useState } from "react"
import {
  Alert,
  Button,
  Container,
  Row,
  Col,
  Modal,
} from "react-bootstrap"
import { useNavigate } from "react-router-dom"

import type { Category, MenuItem } from "../types/menu"
import type { CartItem, CartModification } from "../types/cart"

import { fetchMenu } from "../services/api"
import { createOrder } from "../services/orders"
import { createCustomer } from "../services/customers"

import CategoryList from "../components/CategoryList"
import MenuGrid from "../components/MenuGrid"
import CartPanel from "../components/CartPanel"
import MenuItemModal from "../components/MenuItemModal"
import CheckoutModal, {
  type CheckoutCustomer,
} from "../components/CheckoutModal"



export default function Cashier() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [showCheckout, setShowCheckout] = useState(false)

  const [
    showOrderSuccess,
    setShowOrderSuccess,
  ] = useState(false)

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null)

  useEffect(() => {
    fetchMenu().then((data: Category[]) => {
      setCategories(data)
      setSelectedCategory(data[0])
    })
  }, [])

  function addToCart(
    item: MenuItem,
    quantity: number,
    note: string = "",
    modifications: CartModification[] = []
  ) {
    setCartItems((prev) => {
      const existing = prev.find(
        (cartItem) =>
          cartItem.menuItem.id === item.id &&
          cartItem.note === note
      )

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menuItem.id === item.id &&
          cartItem.note === note
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + quantity,
                totalPrice:
                  (cartItem.quantity + quantity) *
                  Number(item.price),
              }
            : cartItem
        )
      }

      return [
        ...prev,
        {
          menuItem: item,
          quantity,
          note: note ?? "",
          modifications: modifications ?? [],
          totalPrice:
            quantity * Number(item.price),
        },
      ]
    })
  }

  function increase(index: number) {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice:
                (item.quantity + 1) *
                Number(item.menuItem.price),
            }
          : item
      )
    )
  }

  function decrease(index: number) {
    setCartItems((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: item.quantity - 1,
                totalPrice:
                  (item.quantity - 1) *
                  Number(item.menuItem.price),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  async function handleCheckout(
    customerData: CheckoutCustomer
  ) {
    try {
      setCheckoutError(null)
      let customerId

      if ("customer_id" in customerData) {
        customerId =
          customerData.customer_id
      } else {
        const customer =
          await createCustomer(
            customerData
          )

        customerId =
          customer.customer_id
      }

    await createOrder({
      customer_id: customerId,
      note: "",
      status: "created",
      items: cartItems.map((item) => ({
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        note: item.note || "",
        modifications:
          item.modifications?.map(
            (mod) => ({
              ingredient_id:
                mod.ingredient.ingredient_id,

              type: mod.type,

              quantity: 1,

              name_ar:
                mod.ingredient.ingredient_name_ar,
            })
          ) || [],
      })),
    })
      setCartItems([])
      setShowCheckout(false)
      setShowOrderSuccess(true)

      window.setTimeout(() => {
        navigate("/orders")
      }, 1200)
    } catch (error) {
      console.error(error)
      setCheckoutError(
        "تعذر إنشاء الطلب، حاول مرة أخرى"
      )
    }
  }

return (
    <Container fluid className="p-3" style={{ height: "calc(100vh - 56px)", overflow: "auto" }}>
      {checkoutError && (
        <Alert
          variant="danger"
          onClose={() =>
            setCheckoutError(null)
          }
          dismissible
        >
          {checkoutError}
        </Alert>
      )}

      <Row className="h-100" style={{ overflow: "hidden" }}>

        <Col md={2}>
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </Col>

        <Col md={7}>
          <MenuGrid
            category={selectedCategory}
            onItemClick={(item) => {
              setSelectedItem(item)
              setShowModal(true)
            }}
          />
        </Col>

        <Col md={3}>
          <CartPanel
            cartItems={cartItems}
            onAdd={increase}
            onRemove={decrease}
            onCheckout={() => setShowCheckout(true)}
          />
        </Col>

      </Row>

      {selectedItem && (
        <MenuItemModal
          show={showModal}
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onAdd={addToCart}
        />
      )}
      <CheckoutModal
        show={showCheckout}
        onClose={() =>
          setShowCheckout(false)
        }
        onSubmit={handleCheckout}
      />

      <Modal
        show={showOrderSuccess}
        centered
        dir="rtl"
      >
        <Modal.Header>
          <Modal.Title>
            تم إنشاء الطلب
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <div className="fs-5 fw-semibold text-success mb-2">
            تم إنشاء الطلب بنجاح
          </div>
          <div className="text-muted">
            سيتم نقلك إلى صفحة الطلبات
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="success"
            onClick={() =>
              navigate("/orders")
            }
          >
            عرض الطلبات
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
