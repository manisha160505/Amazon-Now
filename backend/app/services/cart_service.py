from typing import Dict, List
from app.models import CartProduct


class CartService:
    """In-memory cart storage for the MVP.

    In production this would be backed by DynamoDB or Amazon ElastiCache.
    """

    def __init__(self):
        self._carts: Dict[str, List[CartProduct]] = {}

    def add_bundle(self, session_id: str, products: List[CartProduct]) -> None:
        cart = self._carts.setdefault(session_id, [])
        for product in products:
            existing = next(
                (item for item in cart if item.productId == product.productId), None
            )
            if existing:
                existing.quantity += product.quantity
            else:
                cart.append(product)

    def get_cart(self, session_id: str) -> List[CartProduct]:
        return self._carts.get(session_id, [])

    def clear_cart(self, session_id: str) -> None:
        self._carts.pop(session_id, None)
