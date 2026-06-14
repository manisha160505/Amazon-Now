import json
import os
from decimal import Decimal
from typing import List, Optional
from app.config import get_settings
from app.models import Product, Bundle
from app.data.seed_data import PRODUCTS, BUNDLES

settings = get_settings()


def _is_local() -> bool:
    return settings.is_local


def _get_table_name(name: str) -> str:
    return os.getenv(name, name)


def _dynamodb_resource():
    import boto3
    if settings.LOCAL_DYNAMODB_URL:
        return boto3.resource("dynamodb", endpoint_url=settings.LOCAL_DYNAMODB_URL)
    return boto3.resource("dynamodb", region_name=settings.AWS_REGION)


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


class DataStore:
    """Data access layer that uses DynamoDB in AWS and seed data locally."""

    def __init__(self):
        self._local_products = {p.productId: p for p in PRODUCTS}
        self._local_bundles = {b.bundleId: b for b in BUNDLES}

    # ---------- Products ----------

    def list_products(self, category: Optional[str] = None) -> List[Product]:
        if _is_local():
            products = list(self._local_products.values())
            if category:
                products = [p for p in products if p.category.lower() == category.lower()]
            return products

        table = _dynamodb_resource().Table(_get_table_name(settings.PRODUCTS_TABLE))
        if category:
            # Simple scan with filter; for MVP this is acceptable
            response = table.scan(
                FilterExpression="category = :c",
                ExpressionAttributeValues={":c": category},
            )
        else:
            response = table.scan()
        return [Product(**self._normalize_item(item)) for item in response.get("Items", [])]

    def get_product(self, product_id: str) -> Optional[Product]:
        if _is_local():
            return self._local_products.get(product_id)

        table = _dynamodb_resource().Table(_get_table_name(settings.PRODUCTS_TABLE))
        response = table.get_item(Key={"productId": product_id})
        item = response.get("Item")
        return Product(**self._normalize_item(item)) if item else None

    # ---------- Bundles ----------

    def list_bundles(self) -> List[Bundle]:
        if _is_local():
            return list(self._local_bundles.values())

        table = _dynamodb_resource().Table(_get_table_name(settings.BUNDLES_TABLE))
        response = table.scan()
        return [Bundle(**self._normalize_item(item)) for item in response.get("Items", [])]

    def get_bundle(self, bundle_id: str) -> Optional[Bundle]:
        if _is_local():
            return self._local_bundles.get(bundle_id)

        table = _dynamodb_resource().Table(_get_table_name(settings.BUNDLES_TABLE))
        response = table.get_item(Key={"bundleId": bundle_id})
        item = response.get("Item")
        return Bundle(**self._normalize_item(item)) if item else None

    # ---------- Helpers ----------

    @staticmethod
    def _normalize_item(item: dict) -> dict:
        """Convert DynamoDB Decimal values to floats for Pydantic."""
        normalized = {}
        for key, value in item.items():
            if isinstance(value, Decimal):
                normalized[key] = float(value)
            elif isinstance(value, list):
                normalized[key] = [
                    float(v) if isinstance(v, Decimal) else v for v in value
                ]
                # Handle nested dicts in lists (e.g. bundle products)
                normalized[key] = [
                    {k: float(v) if isinstance(v, Decimal) else v for k, v in (x.items() if isinstance(x, dict) else {})} if isinstance(x, dict) else x
                    for x in normalized[key]
                ]
            elif isinstance(value, dict):
                normalized[key] = {k: float(v) if isinstance(v, Decimal) else v for k, v in value.items()}
            else:
                normalized[key] = value
        return normalized


def get_store() -> DataStore:
    return DataStore()
