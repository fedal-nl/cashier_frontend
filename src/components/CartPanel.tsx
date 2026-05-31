import {
  Card,
  Button,
  ListGroup,
} from "react-bootstrap"
import type { CartItem } from "../types/cart"
import { formatCurrency } from "../utils/formatters"

type Props = {
  cartItems: CartItem[]
  onAdd: (index: number) => void
  onRemove: (index: number) => void
  onCheckout: () => void
}

export default function CartPanel({
  cartItems,
  onAdd,
  onRemove,
  onCheckout,
}: Props) {
  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.totalPrice,
    0
  )

  return (
    <Card className="h-100 d-flex flex-column">

      <Card.Header className="fw-bold text-center">
        الطلب الحالي
      </Card.Header>

      <Card.Body className="d-flex flex-column p-2">

        <ListGroup className="flex-grow-1 overflow-auto">

          {cartItems.map(
            (item, index) => (
              <ListGroup.Item
                key={index}
              >
                <div className="fw-bold">
                  {
                    item.menuItem
                      .name_ar
                  }
                </div>

                {item.modifications?.map(
                  (
                    mod,
                    modIndex
                  ) => (
                    <div
                      key={
                        modIndex
                      }
                      className="small text-muted"
                    >
                      {mod.type ===
                      "added"
                        ? "+"
                        : "-"}{" "}
                      {
                        mod
                          .ingredient
                          .ingredient_name_ar
                      }
                    </div>
                  )
                )}

                {item.note && (
                  <div className="small fst-italic text-muted">
                    {
                      item.note
                    }
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-2">

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      onRemove(
                        index
                      )
                    }
                  >
                    -
                  </Button>

                  <span>
                    {
                      item.quantity
                    }
                  </span>

                  <Button
                    size="sm"
                    variant="success"
                    onClick={() =>
                      onAdd(
                        index
                      )
                    }
                  >
                    +
                  </Button>

                </div>
              </ListGroup.Item>
            )
          )}

        </ListGroup>

        <div className="mt-3">

          <div className="fw-bold fs-5 text-center mb-3">
            المجموع:{" "}
            {formatCurrency(
              total
            )}
          </div>

          <Button
            variant="primary"
            className="w-100"
            onClick={onCheckout}
          >
            إتمام الطلب
          </Button>

        </div>

      </Card.Body>
    </Card>
  )
}