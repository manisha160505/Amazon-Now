from typing import List
from app.models import Product, Bundle
from app.data.store import get_store
from app.services.session_service import get_trending_bundle_ids, get_recent_search_queries


def get_trending_products(limit: int = 8) -> List[Product]:
    """Get trending products based on recent bundle generations."""
    store = get_store()
    trending_ids = get_trending_bundle_ids(limit=5)

    product_ids = set()
    for bundle_id in trending_ids:
        bundle = store.get_bundle(bundle_id)
        if bundle:
            for item in bundle.products:
                product_ids.add(item.productId)

    products = []
    seen = set()
    for pid in product_ids:
        if pid in seen:
            continue
        product = store.get_product(pid)
        if product:
            products.append(product)
            seen.add(pid)
        if len(products) >= limit:
            break

    # Fallback: return first few products if no sessions yet
    if not products:
        products = store.list_products()[:limit]

    return products


def get_recommendations(limit: int = 8) -> dict:
    """Return home page recommendations."""
    return {
        "trendingProducts": [p.model_dump() for p in get_trending_products(limit=limit)],
        "recentSearches": get_recent_search_queries(limit=5),
        "trendingBundles": get_trending_bundle_ids(limit=5),
    }
