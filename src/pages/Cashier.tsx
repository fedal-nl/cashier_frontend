import { useEffect, useState } from "react"
import { Container, Row, Col } from "react-bootstrap"

import type { Category, MenuItem } from "../types/menu"
import type { CartItem, CartModification } from "../types/cart"

import { fetchMenu } from "../services/api"
import { createOrder } from "../services/orders"
import { createCustomer, findCustomer } from "../services/customers"

import CategoryList from "../components/CategoryList"
import MenuGrid from "../components/MenuGrid"
import CartPanel from "../components/CartPanel"
import MenuItemModal from "../components/MenuItemModal"
import CheckoutModal from "../components/CheckoutModal"



export default function Cashier() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [showCheckout, setShowCheckout] = useState(false)

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
    customerData: any
  ) {
    try {
      let customerId

      const existing =
        await findCustomer(
          customerData.phone_number
        )

      if (existing.exists) {
        customerId =
          existing.customer.id
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

      alert("تم إنشاء الطلب بنجاح")
    } catch (error) {
      console.error(error)
      alert("حدث خطأ")
    }
  }

return (
    <Container fluid className="vh-100 p-3">
      <Row className="h-100">

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
    </Container>
  )
}