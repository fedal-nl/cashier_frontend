import { Card } from 'react-bootstrap'
import {type MenuItem} from "../types/menu"
import { formatCurrency } from "../utils/formatters"

type Props = {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
};

export default function MenuItemButton({ item, onClick }: Props) {
  return (
    <Card
      className="h-100 shadow-sm text-center p-3"
      style={{ cursor: "pointer", minHeight: "160px" }}
      onClick={() => onClick(item)}
    >
    <Card.Body>
        <Card.Title>{item.name_ar}</Card.Title>
        <Card.Text>
          {formatCurrency(Number(item.price))}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}