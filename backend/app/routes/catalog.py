from typing import Optional
from fastapi import APIRouter, Query
from app.models import Product, Bundle
from app.data.store import get_store
from app.services.recommendations import get_recommendations, get_trending_products

router = APIRouter(tags=["catalog"])
store = get_store()


@router.get("/products", response_model=list[Product])
def list_products(category: Optional[str] = Query(default=None)):
    return store.list_products(category)


@router.get("/bundles", response_model=list[Bundle])
def list_bundles():
    return store.list_bundles()


@router.get("/trending")
def trending_products(limit: Optional[int] = Query(default=8, ge=1, le=20)):
    return {
        "products": [p.model_dump() for p in get_trending_products(limit=limit)],
    }


@router.get("/recommendations")
def recommendations(limit: Optional[int] = Query(default=8, ge=1, le=20)):
    return get_recommendations(limit=limit)
