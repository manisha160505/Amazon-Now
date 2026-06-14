"""Seed DynamoDB tables with initial products and bundles.

Run locally against AWS or local DynamoDB:
    python scripts/seed_dynamodb.py

With local DynamoDB:
    LOCAL_DYNAMODB_URL=http://localhost:8000 python scripts/seed_dynamodb.py
"""
import boto3
from decimal import Decimal
from app.config import get_settings
from app.data.seed_data import PRODUCTS, BUNDLES

settings = get_settings()


def to_dynamodb_item(obj: dict) -> dict:
    """Recursively convert floats to Decimals for DynamoDB."""
    result = {}
    for key, value in obj.items():
        if isinstance(value, float):
            result[key] = Decimal(str(value))
        elif isinstance(value, list):
            result[key] = [
                to_dynamodb_item(x) if isinstance(x, dict)
                else Decimal(str(x)) if isinstance(x, float)
                else x
                for x in value
            ]
        elif isinstance(value, dict):
            result[key] = to_dynamodb_item(value)
        else:
            result[key] = value
    return result


def get_dynamodb_resource():
    if settings.LOCAL_DYNAMODB_URL:
        return boto3.resource(
            "dynamodb",
            endpoint_url=settings.LOCAL_DYNAMODB_URL,
            region_name=settings.AWS_REGION,
        )
    return boto3.resource("dynamodb", region_name=settings.AWS_REGION)


def create_table(dynamodb, table_name: str, key_schema: list, attribute_definitions: list):
    try:
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=key_schema,
            AttributeDefinitions=attribute_definitions,
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        print(f"Created table: {table_name}")
    except dynamodb.meta.client.exceptions.ResourceInUseException:
        print(f"Table already exists: {table_name}")


def seed():
    dynamodb = get_dynamodb_resource()

    create_table(
        dynamodb,
        settings.PRODUCTS_TABLE,
        key_schema=[{"AttributeName": "productId", "KeyType": "HASH"}],
        attribute_definitions=[{"AttributeName": "productId", "AttributeType": "S"}],
    )
    create_table(
        dynamodb,
        settings.BUNDLES_TABLE,
        key_schema=[{"AttributeName": "bundleId", "KeyType": "HASH"}],
        attribute_definitions=[{"AttributeName": "bundleId", "AttributeType": "S"}],
    )
    create_table(
        dynamodb,
        settings.SESSIONS_TABLE,
        key_schema=[{"AttributeName": "sessionId", "KeyType": "HASH"}],
        attribute_definitions=[{"AttributeName": "sessionId", "AttributeType": "S"}],
    )

    products_table = dynamodb.Table(settings.PRODUCTS_TABLE)
    bundles_table = dynamodb.Table(settings.BUNDLES_TABLE)

    with products_table.batch_writer() as batch:
        for product in PRODUCTS:
            batch.put_item(Item=to_dynamodb_item(product.model_dump()))
    print(f"Seeded {len(PRODUCTS)} products into {settings.PRODUCTS_TABLE}")

    with bundles_table.batch_writer() as batch:
        for bundle in BUNDLES:
            batch.put_item(Item=to_dynamodb_item(bundle.model_dump()))
    print(f"Seeded {len(BUNDLES)} bundles into {settings.BUNDLES_TABLE}")


if __name__ == "__main__":
    seed()
