import { useState, useEffect } from "react"
import { Modal, Button, Form } from "react-bootstrap"
import type {
  MenuItem,
  Ingredient,
} from "../types/menu"
import type { CartModification } from "../types/cart"
import { formatCurrency } from "../utils/formatters"


type Props = {
  show: boolean
  item: MenuItem | null
  onClose: () => void
  onAdd: (
    item: MenuItem,
    quantity: number,
    note: string,
    modifications: CartModification[]
  ) => void
}

export default function MenuItemModal({
  show,
  item,
  onClose,
  onAdd,
}: Props) {
  const [quantity, setQuantity] =
    useState<number>(1)

  const [note, setNote] =
    useState<string>("")

  const [modifications, setModifications] =
    useState<CartModification[]>([])

  useEffect(() => {
    if (show) {
      setQuantity(1)
      setNote("")
      setModifications([])
    }
  }, [show])

  if (!item) return null

    function toggleIngredient(
    ingredient: Ingredient,
    type: "added" | "removed"
    ) {
    setModifications((prev) => {
        const sameTypeExists = prev.find(
        (m) =>
            m.ingredient.ingredient_id ===
            ingredient.ingredient_id &&
            m.type === type
        )

        // If same state clicked again → unselect
        if (sameTypeExists) {
        return prev.filter(
            (m) =>
            !(
                m.ingredient.ingredient_id ===
                ingredient.ingredient_id &&
                m.type === type
            )
        )
        }

        // Remove opposite state first
        const withoutOpposite =
        prev.filter(
            (m) =>
            m.ingredient.ingredient_id !==
            ingredient.ingredient_id
        )

        // Add new state
        return [
        ...withoutOpposite,
        { ingredient, type },
        ]
    })
    }

  const totalPrice =
    (
      Number(item.price) +
      modifications.reduce(
        (sum, mod) => {
          if (mod.type === "added") {
            return (
              sum +
              Number(
                mod.ingredient.price
              )
            )
          }

          if (mod.type === "removed") {
            return (
              sum -
              Number(
                mod.ingredient.price
              )
            )
          }

          return sum
        },
        0
      )
    ) * quantity

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {item.name_ar}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {item.description_ar && (
          <p className="text-muted">
            {item.description_ar}
          </p>
        )}

        <div className="fw-bold fs-5 mb-4">
          السعر الأساسي:{" "}
          {formatCurrency(
            Number(item.price)
          )}
        </div>

        <Form.Group className="mb-4">
          <Form.Label>
            الكمية
          </Form.Label>

          <Form.Control
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Number(
                  e.target.value
                )
              )
            }
          />
        </Form.Group>

        {item.ingredients.length >
          0 && (
          <Form.Group className="mb-4">
            <Form.Label>
              التعديلات
            </Form.Label>

            <div className="d-flex flex-column gap-2">

              {item.ingredients.map(
                (
                  ingredient
                ) => {
                  const isRemoved =
                    modifications.some(
                      (m) =>
                        m
                          .ingredient
                          .ingredient_id ===
                          ingredient.ingredient_id &&
                        m.type ===
                          "removed"
                    )

                  const isAdded =
                    modifications.some(
                      (m) =>
                        m
                          .ingredient
                          .ingredient_id ===
                          ingredient.ingredient_id &&
                        m.type ===
                          "added"
                    )

                  return (
                    <div
                      key={
                        ingredient.ingredient_id
                      }
                      className="border rounded p-3 bg-light"
                    >
                      <div className="fw-bold mb-2">
                        {
                          ingredient.ingredient_name_ar
                        }
                      </div>

                      <div className="d-flex gap-2">

                        {ingredient.is_removable &&
                          ingredient.is_default && (
                            <Button
                              size="sm"
                              variant={
                                isRemoved
                                  ? "danger"
                                  : "outline-danger"
                              }
                              onClick={() =>
                                toggleIngredient(
                                  ingredient,
                                  "removed"
                                )
                              }
                            >
                              إزالة
                            </Button>
                          )}

                        {ingredient.is_addable && (
                          <Button
                            size="sm"
                            variant={
                              isAdded
                                ? "success"
                                : "outline-success"
                            }
                            onClick={() =>
                              toggleIngredient(
                                ingredient,
                                "added"
                              )
                            }
                          >
                            إضافة (
                            {formatCurrency(
                              Number(
                                ingredient.price
                              )
                            )}
                            )
                          </Button>
                        )}

                      </div>
                    </div>
                  )
                }
              )}

            </div>
          </Form.Group>
        )}

        <Form.Group className="mb-4">
          <Form.Label>
            ملاحظة
          </Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            value={note}
            onChange={(e) =>
              setNote(
                e.target.value
              )
            }
            placeholder="مثال: بدون بصل"
          />
        </Form.Group>

        <div className="text-end fw-bold fs-4 text-success">
          المجموع:{" "}
          {formatCurrency(
            totalPrice
          )}
        </div>

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
        onClick={() => {
            onAdd(
            item,
            quantity,
            note,
            modifications
            )
            onClose()
        }}
        >
        إضافة للسلة
        </Button>
      </Modal.Footer>
    </Modal>
  )
}