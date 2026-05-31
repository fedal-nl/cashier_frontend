import { Row, Col } from "react-bootstrap"
import type { Category, MenuItem } from "../types/menu"
import MenuItemButton from "./MenuItemButton"

type Props = {
  category: Category | null
  onItemClick: (item: MenuItem) => void
}

export default function MenuGrid({
  category,
  onItemClick,
}: Props) {
  if (!category) return null

  return (
    <Row xs={2} md={3} lg={4} className="g-3">
      {category.items.map((item) => (
        <Col key={item.id}>
          <MenuItemButton
            item={item}
            onClick={onItemClick}
          />
        </Col>
      ))}
    </Row>
  )
}