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
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom"

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
  fetchOrder,
  fetchOrderTypes,
  type DeliveryCompany,
  type OrderDetail,
  type OrderItem,
  type OrderType,
  updateOrder,
} from "../services/orders"
import { createCustomer } from "../services/customers"

import CategoryList from "../components/CategoryList"
import MenuGrid from "../components/MenuGrid"
import CartPanel from "../components/CartPanel"
import MenuItemModal from "../components/MenuItemModal"
import CheckoutModal, {
  type CheckoutData,
} from "../components/CheckoutModal"

function findMenuItem(
  categories: Category[],
  menuItemId: number
) {
  for (const category of categories) {
    const item = category.items.find(
      (menuItem) =>
        menuItem.id === menuItemId
    )

    if (item) {
      return item
    }
  }

  return null
}

function orderItemToCartItem(
  orderItem: OrderItem,
  categories: Category[]
): CartItem {
  const menuItem =
    findMenuItem(
      categories,
      orderItem.menu_item_id
    ) ?? {
      id: orderItem.menu_item_id,
      name_ar: orderItem.menu_item_name_ar,
      price:
        orderItem.menu_item_base_price,
      category_id: 0,
      category_name_ar: "",
      quantity: 0,
      unit_id: 0,
      unit_name_ar: "",
      is_active: true,
      ingredients:
        orderItem.modifications.map(
          (modification) => ({
            ingredient_id:
              modification.ingredient_id,
            ingredient_name_ar:
              modification.ingredient_name_ar,
            price:
              modification.ingredient_price,
            unit_id:
              modification.unit_id ?? 0,
            unit_name_ar:
              modification.unit_name_ar ?? "",
            is_default:
              modification.modification_type ===
              "removed",
            is_removable: true,
            is_addable: true,
          })
        ),
    }

  return {
    menuItem,
    quantity: orderItem.quantity,
    note: orderItem.order_item_note ?? "",
    modifications:
      orderItem.modifications.map(
        (modification) => ({
          ingredient:
            menuItem.ingredients.find(
              (ingredient) =>
                ingredient.ingredient_id ===
                modification.ingredient_id
            ) ?? {
              ingredient_id:
                modification.ingredient_id,
              ingredient_name_ar:
                modification.ingredient_name_ar,
              price:
                modification.ingredient_price,
              unit_id:
                modification.unit_id ?? 0,
              unit_name_ar:
                modification.unit_name_ar ?? "",
              is_default:
                modification.modification_type ===
                "removed",
              is_removable: true,
              is_addable: true,
            },
          type:
            modification.modification_type,
        })
      ),
    totalPrice: Number(
      orderItem.total_price
    ),
  }
}

export default function Cashier() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editOrderId =
    searchParams.get("editOrder")

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)
  const [loadedMenuBranchId, setLoadedMenuBranchId] =
    useState("")

  const [branches, setBranches] =
    useState<Branch[]>([])

  const [selectedBranchId, setSelectedBranchId] =
    useState("")

  const [
    deliveryCompanies,
    setDeliveryCompanies,
  ] = useState<DeliveryCompany[]>([])

  const [orderTypes, setOrderTypes] =
    useState<OrderType[]>([])

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] =
    useState<OrderDetail | null>(null)
  const [
    loadingEditOrder,
    setLoadingEditOrder,
  ] = useState(false)
  const [
    editOrderLoaded,
    setEditOrderLoaded,
  ] = useState(false)
  const [
    savingOrderUpdate,
    setSavingOrderUpdate,
  ] = useState(false)

  const [showCheckout, setShowCheckout] = useState(false)

  const [
    showOrderSuccess,
    setShowOrderSuccess,
  ] = useState(false)

  const [createdOrderId, setCreatedOrderId] =
    useState<string | null>(null)

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null)

  const isEditingOrder =
    Boolean(editOrderId)

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

    fetchOrderTypes()
      .then((data) => {
        setOrderTypes(
          [...data].sort((a, b) => {
            if (a.value === "dine_in") {
              return -1
            }

            if (b.value === "dine_in") {
              return 1
            }

            return 0
          })
        )
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    if (!editOrderId) {
      return
    }

    let isActive = true

    const timeoutId = window.setTimeout(() => {
      setLoadingEditOrder(true)
      setEditOrderLoaded(false)

      fetchOrder(editOrderId)
        .then((order) => {
          if (!isActive) {
            return
          }

          setEditingOrder(order)
          setSelectedBranchId(
            String(order.branch?.id ?? "")
          )
        })
        .catch((error) => {
          console.error(error)
          if (isActive) {
            setCheckoutError(
              "تعذر تحميل الطلب للتعديل"
            )
          }
        })
        .finally(() => {
          if (isActive) {
            setLoadingEditOrder(false)
          }
        })
    }, 0)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [editOrderId])

  useEffect(() => {
    if (!selectedBranchId) {
      return
    }

    fetchMenu(selectedBranchId)
      .then((data: Category[]) => {
        setCategories(data)
        setSelectedCategory(data[0] ?? null)
        setLoadedMenuBranchId(selectedBranchId)
      })
      .catch((error) => {
        console.error(error)
        setCategories([])
        setSelectedCategory(null)
        setLoadedMenuBranchId("")
      })
  }, [selectedBranchId])

  useEffect(() => {
    if (
      !editingOrder ||
      editOrderLoaded ||
      categories.length === 0 ||
      loadedMenuBranchId !== selectedBranchId ||
      String(editingOrder.branch?.id ?? "") !==
        selectedBranchId
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCartItems(
        editingOrder.items.map((item) =>
          orderItemToCartItem(
            item,
            categories
          )
        )
      )
      setEditOrderLoaded(true)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    categories,
    editingOrder,
    editOrderLoaded,
    loadedMenuBranchId,
    selectedBranchId,
  ])

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

  function getOrderItemsPayload() {
    return cartItems.map((item) => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
      note: item.note || "",
      modifications:
        item.modifications?.map((mod) => ({
          ingredient_id:
            mod.ingredient.ingredient_id,
          type: mod.type,
          quantity: 1,
          name_ar:
            mod.ingredient
              .ingredient_name_ar,
        })) || [],
    }))
  }

  async function handleSaveOrderUpdate() {
    if (!editOrderId || !editingOrder) {
      return
    }

    if (!selectedBranchId) {
      setCheckoutError(
        "اختر الفرع قبل حفظ التعديلات"
      )
      return
    }

    try {
      setSavingOrderUpdate(true)
      setCheckoutError(null)

      await updateOrder(editOrderId, {
        customer_id:
          editingOrder.customer?.id ?? null,
        branch_id: Number(selectedBranchId),
        delivery_company_id:
          editingOrder.delivery_company?.id ??
          null,
        order_type:
          editingOrder.order_type,
        note: editingOrder.note ?? "",
        status: editingOrder.status,
        items: getOrderItemsPayload(),
      })

      navigate(`/orders/${editOrderId}`)
    } catch (error) {
      console.error(error)
      setCheckoutError(
        "تعذر حفظ تعديلات الطلب، حاول مرة أخرى"
      )
    } finally {
      setSavingOrderUpdate(false)
    }
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
      let customerId: number | null = null

      if (customerData) {
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
      }

      const order =
        await createOrder({
          customer_id: customerId,
          branch_id: Number(selectedBranchId),
          delivery_company_id:
            checkoutData.delivery_company_id ??
            null,
          order_type:
            checkoutData.order_type,
          note: checkoutData.orderNote ?? "",
          status: "created",
          items: getOrderItemsPayload(),
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

  function handleCartAction() {
    if (isEditingOrder) {
      void handleSaveOrderUpdate()
      return
    }

    setShowCheckout(true)
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

      {isEditingOrder && (
        <Alert
          variant="info"
          className="d-flex flex-column flex-md-row justify-content-between gap-2"
          dir="rtl"
        >
          <div>
            {loadingEditOrder
              ? "جاري تحميل الطلب للتعديل..."
              : "أنت تقوم بتعديل طلب موجود. أضف أو احذف الأصناف ثم احفظ التعديلات."}
          </div>

          {editOrderId && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() =>
                navigate(
                  `/orders/${editOrderId}`
                )
              }
            >
              الرجوع للطلب
            </Button>
          )}
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
            onCheckout={handleCartAction}
            actionLabel={
              isEditingOrder
                ? savingOrderUpdate
                  ? "جاري الحفظ..."
                  : "حفظ التعديلات"
                : "إتمام الطلب"
            }
            actionDisabled={
              loadingEditOrder ||
              savingOrderUpdate
            }
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
        orderTypes={orderTypes}
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
