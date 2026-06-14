from fastapi import APIRouter, Header
from pydantic import BaseModel, Field
from app.models import GenerateCartRequest, GenerateCartResponse, AddBundleRequest, AddBundleResponse
from app.services.intent_engine import detect_intent
from app.services.bundle_generator import BundleGenerator
from app.services.question_engine import QuestionEngine
from app.services.cart_service import CartService
from app.services.session_service import log_session
from app.data.store import get_store

router = APIRouter(tags=["cart"])

bundle_generator = BundleGenerator()
cart_service = CartService()
store = get_store()


class SplitBillRequest(BaseModel):
    total: float = Field(..., gt=0)
    people: int = Field(..., ge=2, le=100)


class SplitBillResponse(BaseModel):
    total: float
    people: int
    perPerson: float
    remainder: float


@router.post("/generate-cart", response_model=GenerateCartResponse)
def generate_cart(
    payload: GenerateCartRequest,
    x_session_id: str = Header(default="demo-session")
):
    result = detect_intent(payload.query)

    # If we have no context yet and this bundle supports clarifying questions, ask them first.
    if not payload.context and QuestionEngine.needs_questions(result.bundle):
        remaining_questions, prefilled_context = QuestionEngine.get_questions(
            result.bundle, payload.query
        )

        # If the query answered everything, generate the cart directly.
        if not remaining_questions:
            products = bundle_generator.resolve_bundle(result.bundle, budget=payload.budget)
            products = QuestionEngine.apply_context(products, prefilled_context)
            total = sum(p.price * p.quantity for p in products)
            estimated_delivery = bundle_generator.estimate_delivery(products)
            cart = GenerateCartResponse(
                intent=result.intent,
                urgency=result.urgency,
                category=result.category,
                bundle=result.bundle.bundleName,
                bundleId=result.bundle.bundleId,
                products=products,
                total=round(total, 2),
                estimatedDelivery=estimated_delivery,
            )
            log_session(x_session_id, payload.query, cart)
            return cart

        return GenerateCartResponse(
            intent=result.intent,
            urgency=result.urgency,
            category=result.category,
            bundle=result.bundle.bundleName,
            bundleId=result.bundle.bundleId,
            questions=remaining_questions,
            prefilledContext=prefilled_context,
        )

    products = bundle_generator.resolve_bundle(result.bundle, budget=payload.budget)

    # Apply context adjustments if user answered clarifying questions.
    if payload.context:
        products = QuestionEngine.apply_context(products, payload.context)

    total = sum(p.price * p.quantity for p in products)
    estimated_delivery = bundle_generator.estimate_delivery(products)

    cart = GenerateCartResponse(
        intent=result.intent,
        urgency=result.urgency,
        category=result.category,
        bundle=result.bundle.bundleName,
        bundleId=result.bundle.bundleId,
        products=products,
        total=round(total, 2),
        estimatedDelivery=estimated_delivery,
    )

    log_session(x_session_id, payload.query, cart)
    return cart


@router.post("/add-bundle-to-cart", response_model=AddBundleResponse)
def add_bundle_to_cart(
    payload: AddBundleRequest,
    x_session_id: str = Header(default="demo-session")
):
    bundle = store.get_bundle(payload.bundleId)
    if not bundle:
        return AddBundleResponse(success=False, message="Bundle not found")

    products = bundle_generator.resolve_bundle(bundle)
    if payload.products:
        products = [p for p in products if p.productId in payload.products]

    cart_service.add_bundle(x_session_id, products)

    return AddBundleResponse(
        success=True,
        message=f"Added {len(products)} items from {bundle.bundleName} to cart"
    )


@router.post("/split-bill", response_model=SplitBillResponse)
def split_bill(payload: SplitBillRequest):
    per_person = payload.total / payload.people
    rounded = round(per_person, 2)
    remainder = round(payload.total - (rounded * payload.people), 2)
    return SplitBillResponse(
        total=payload.total,
        people=payload.people,
        perPerson=rounded,
        remainder=remainder,
    )
