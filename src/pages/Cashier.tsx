import { useEffect, useState } from "react"
import {
  Alert,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap"
import { useNavigate } from "react-router-dom"

import type { Category, MenuItem } from "../types/menu"
import type { CartItem, CartModification } from "../types/cart"

import {
  fetchBranches,
  fetchMenu,
  type Branch,
} from "../services/api"
import {
  createOrder,
  fetchDeliveryCompanies,
  type DeliveryCompany,
} from "../services/orders"
import { createCustomer } from "../services/customers"

import CategoryList from "../components/CategoryList"
import MenuGrid from "../components/MenuGrid"
import CartPanel from "../components/CartPanel"
import MenuItemModal from "../components/MenuItemModal"
import CheckoutModal, {
  type CheckoutData,
} from "../components/CheckoutModal"



export default function Cashier() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  const [branches, setBranches] =
    useState<Branch[]>([])

  const [selectedBranchId, setSelectedBranchId] =
    useState("")

  const [
    deliveryCompanies,
    setDeliveryCompanies,
  ] = useState<DeliveryCompany[]>([])

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [showCheckout, setShowCheckout] = useState(false)

  const [
    showOrderSuccess,
    setShowOrderSuccess,
  ] = useState(false)

  const [createdOrderId, setCreatedOrderId] =
    useState<string | null>(null)

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null)

  useEffect(() => {
    fetchBranches()
      .then((data) => {
        setBranches(data)
        setSelectedBranchId(
          (currentBranchId) =>
            currentBranchId ||
            String(data[0]?.id ?? "")
        )
      })
      .catch((error) => {
        console.error(error)
      })

    fetchDeliveryCompanies()
      .then(setDeliveryCompanies)
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    if (!selectedBranchId) {
      return
    }

    fetchMenu(selectedBranchId)
      .then((data: Category[]) => {
        setCategories(data)
        setSelectedCategory(data[0] ?? null)
      })
      .catch((error) => {
        console.error(error)
        setCategories([])
        setSelectedCategory(null)
      })
  }, [selectedBranchId])

  function handleBranchChange(
    branchId: string
  ) {
    if (!branchId) {
      return
    }

    setSelectedBranchId(branchId)
    setCartItems([])
    setSelectedItem(null)
    setShowModal(false)
  }

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
    checkoutData: CheckoutData
  ) {
    try {
      setCheckoutError(null)

      if (!selectedBranchId) {
        setCheckoutError(
          "اختر الفرع قبل إنشاء الطلب"
        )
        return
      }

      const customerData =
        checkoutData.customer
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

    const order =
      await createOrder({
      customer_id: customerId,
      branch_id: Number(selectedBranchId),
      delivery_company_id:
        checkoutData.delivery_company_id,
      note: checkoutData.orderNote ?? "",
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
      setCreatedOrderId(order.order_id)
      setShowOrderSuccess(true)

      window.setTimeout(() => {
        navigate(
          `/orders/${order.order_id}`
        )
      }, 1200)
    } catch (error) {
      console.error(error)
      setCheckoutError(
        "تعذر إنشاء الطلب، حاول مرة أخرى"
      )
    }
  }

return (
    <Container
      fluid
      className="cashier-page p-3"
    >
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

      <div className="mb-3" dir="rtl">
        <Form.Group
          className="branch-selector"
          controlId="cashier-branch"
        >
          <Form.Label>
            الفرع
          </Form.Label>
          <Form.Select
            value={selectedBranchId}
            onChange={(event) =>
              handleBranchChange(
                event.target.value
              )
            }
            required
          >
            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
                {branch.location
                  ? ` - ${branch.location}`
                  : ""}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <Row className="cashier-row g-3">

        <Col
          lg={2}
          className="cashier-scroll-column"
        >
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </Col>

        <Col
          lg={7}
          className="cashier-scroll-column"
        >
          <MenuGrid
            category={selectedCategory}
            onItemClick={(item) => {
              setSelectedItem(item)
              setShowModal(true)
            }}
          />
        </Col>

        <Col
          lg={3}
          className="cashier-cart-column"
        >
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
        deliveryCompanies={deliveryCompanies}
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
            سيتم نقلك إلى صفحة تفاصيل الطلب
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="success"
            onClick={() =>
              navigate(
                createdOrderId
                  ? `/orders/${createdOrderId}`
                  : "/orders"
              )
            }
          >
            عرض الطلب
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
