from typing import List, Optional
from pydantic import BaseModel, Field


class Product(BaseModel):
    productId: str
    productName: str
    category: str
    price: float
    imageUrl: str
    deliveryTime: str
    stock: int = 100


class BundleItem(BaseModel):
    productId: str
    quantity: int = 1
    defaultSelected: bool = True


class Bundle(BaseModel):
    bundleId: str
    bundleName: str
    intent: str
    category: str
    urgency: str
    keywords: List[str]
    products: List[BundleItem]


class CartProduct(BaseModel):
    productId: str
    productName: str
    category: str
    price: float
    imageUrl: str
    deliveryTime: str
    quantity: int


class ClarifyingQuestion(BaseModel):
    id: str
    text: str
    options: List[str]


class GenerateCartRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    budget: Optional[float] = Field(default=None, gt=0, le=1000000)
    context: Optional[dict] = Field(default=None)


class GenerateCartResponse(BaseModel):
    intent: Optional[str] = None
    urgency: Optional[str] = None
    category: Optional[str] = None
    bundle: Optional[str] = None
    bundleId: Optional[str] = None
    products: List[CartProduct] = []
    total: float = 0.0
    estimatedDelivery: Optional[str] = None
    questions: Optional[List[ClarifyingQuestion]] = None
    prefilledContext: Optional[dict] = None


class AddBundleRequest(BaseModel):
    bundleId: str
    products: Optional[List[str]] = None


class AddBundleResponse(BaseModel):
    success: bool
    message: str


class SessionRecord(BaseModel):
    sessionId: str
    query: str
    generatedBundle: dict
    timestamp: str
