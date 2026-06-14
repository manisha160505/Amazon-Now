from typing import List, Optional
from app.models import Bundle, CartProduct
from app.data.store import get_store


class BundleGenerator:
    def __init__(self):
        self._store = get_store()

    def resolve_bundle(
        self, bundle: Bundle, budget: Optional[float] = None
    ) -> List[CartProduct]:
        cart_products: List[CartProduct] = []
        for item in bundle.products:
            product = self._store.get_product(item.productId)
            if product is None:
                continue
            cart_products.append(
                CartProduct(
                    productId=product.productId,
                    productName=product.productName,
                    category=product.category,
                    price=product.price,
                    imageUrl=product.imageUrl,
                    deliveryTime=product.deliveryTime,
                    quantity=item.quantity,
                )
            )

        if budget is not None:
            cart_products = self._optimize_for_budget(cart_products, budget)

        return cart_products

    def _optimize_for_budget(
        self, products: List[CartProduct], budget: float
    ) -> List[CartProduct]:
        """Return the best subset of products that fits within the budget.

        Strategy:
        1. If the full bundle already fits, return it.
        2. Otherwise drop the most expensive items first until under budget.
        3. If a single item still exceeds budget, reduce its quantity to 1.
        4. Always try to keep at least one product.
        """
        total = sum(p.price * p.quantity for p in products)
        if total <= budget:
            return products

        # Sort by unit price descending so we drop expensive items first
        sorted_products = sorted(products, key=lambda p: p.price, reverse=True)
        optimized: List[CartProduct] = []
        remaining = budget

        # Try to include cheaper items first for maximum variety
        for product in reversed(sorted_products):
            cost = product.price * product.quantity
            if cost <= remaining:
                optimized.append(product)
                remaining -= cost

        # If we couldn't fit anything, force at least the cheapest single item
        if not optimized and sorted_products:
            cheapest = sorted_products[-1]
            optimized.append(cheapest.model_copy(update={"quantity": 1}))

        return list(reversed(optimized))

    def estimate_delivery(self, products: List[CartProduct]) -> str:
        if not products:
            return "N/A"
        # Pick the fastest delivery time among products
        priority = {
            "20 min": 1,
            "30 min": 2,
            "45 min": 3,
            "1 hr": 4,
            "2 hrs": 5,
            "1 day": 6,
        }
        sorted_products = sorted(
            products, key=lambda p: priority.get(p.deliveryTime, 99)
        )
        return sorted_products[0].deliveryTime
