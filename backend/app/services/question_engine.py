from typing import List, Optional
from app.models import Bundle, ClarifyingQuestion, CartProduct
from app.services.context_extractor import extract_context_from_query


class QuestionEngine:
    """Generates clarifying questions and applies context adjustments to bundles."""

    QUESTIONS = {
        "party-kit": [
            ClarifyingQuestion(
                id="guest_count",
                text="How many guests are coming?",
                options=["1-2", "3-5", "6-10", "10+"],
            ),
            ClarifyingQuestion(
                id="diet",
                text="What kind of food preferences?",
                options=["Vegetarian", "Mixed", "Non-veg only"],
            ),
            ClarifyingQuestion(
                id="occasion",
                text="What's the occasion?",
                options=["Casual hangout", "Birthday", "House party", "Formal dinner"],
            ),
        ],
        "recovery-kit": [
            ClarifyingQuestion(
                id="patient",
                text="Who is unwell?",
                options=["Adult", "Child", "Senior"],
            ),
            ClarifyingQuestion(
                id="symptoms",
                text="What are the main symptoms?",
                options=["Fever", "Cold & cough", "Stomach issues", "Headache / body pain"],
            ),
        ],
        "pasta-night-kit": [
            ClarifyingQuestion(
                id="people",
                text="How many people are eating?",
                options=["Just me", "2 people", "3-4 people", "5+ people"],
            ),
            ClarifyingQuestion(
                id="diet",
                text="Any dietary preference?",
                options=["Regular", "Vegetarian", "Vegan", "Gluten-free"],
            ),
        ],
        "movie-night-kit": [
            ClarifyingQuestion(
                id="people",
                text="How many people are watching?",
                options=["Just me", "2 people", "3-4 people", "5+ people"],
            ),
            ClarifyingQuestion(
                id="snack_pref",
                text="What snacks do you prefer?",
                options=["Salty", "Sweet", "Both", "Healthy"],
            ),
        ],
        "home-setup-kit": [
            ClarifyingQuestion(
                id="setup_type",
                text="What kind of setup is this?",
                options=["Moving in", "Deep clean", "Restock essentials"],
            ),
            ClarifyingQuestion(
                id="people",
                text="How many people is this for?",
                options=["1 person", "2 people", "Family (3-4)", "5+ people"],
            ),
        ],
        "baby-essentials-kit": [
            ClarifyingQuestion(
                id="baby_age",
                text="How old is the baby?",
                options=["Newborn (0-3 months)", "Infant (3-12 months)", "Toddler (1-3 years)"],
            ),
            ClarifyingQuestion(
                id="priority",
                text="What's the priority?",
                options=["Daily essentials", "Travel kit", "Sick care"],
            ),
        ],
        "room-decor-kit": [
            ClarifyingQuestion(
                id="room",
                text="Which room are you decorating?",
                options=["Bedroom", "Living room", "Study", "Balcony"],
            ),
            ClarifyingQuestion(
                id="vibe",
                text="What vibe are you going for?",
                options=["Cozy / warm", "Aesthetic / modern", "Colorful / festive", "Minimal"],
            ),
        ],
        "festival-kit": [
            ClarifyingQuestion(
                id="festival",
                text="Which festival?",
                options=["Raksha Bandhan", "Diwali", "Other"],
            ),
            ClarifyingQuestion(
                id="people",
                text="How many people are celebrating?",
                options=["1-2", "3-5", "6-10", "10+"],
            ),
        ],
        "cleaning-kit": [
            ClarifyingQuestion(
                id="area",
                text="Which area needs cleaning?",
                options=["Kitchen", "Bathroom", "Living room", "Full house"],
            ),
            ClarifyingQuestion(
                id="level",
                text="How messy is it?",
                options=["Light tidy up", "Moderate", "Deep clean needed"],
            ),
        ],
        "study-work-kit": [
            ClarifyingQuestion(
                id="session",
                text="How long is the session?",
                options=["Few hours", "All nighter", "Full work day"],
            ),
            ClarifyingQuestion(
                id="beverage",
                text="Preferred energy source?",
                options=["Coffee", "Tea", "Energy bars", "Water"],
            ),
        ],
    }

    @staticmethod
    def get_questions(bundle: Bundle, query: str = "") -> tuple[List[ClarifyingQuestion], dict]:
        """Return questions not already answered by the query, plus extracted context."""
        all_questions = QuestionEngine.QUESTIONS.get(bundle.bundleId, [])
        extracted = extract_context_from_query(query)

        remaining = [
            q for q in all_questions
            if extracted.get(q.id) is None
        ]
        return remaining, extracted

    @staticmethod
    def needs_questions(bundle: Bundle) -> bool:
        return bundle.bundleId in QuestionEngine.QUESTIONS

    @staticmethod
    def apply_context(products: List[CartProduct], context: dict) -> List[CartProduct]:
        """Adjust quantities and filter products based on user answers."""
        if not context:
            return products

        multiplier = 1.0
        guest_count = context.get("guest_count") or context.get("people")
        if guest_count:
            multiplier = _guest_multiplier(guest_count)

        # Apply quantity multiplier
        adjusted: List[CartProduct] = []
        for product in products:
            new_qty = max(1, int(product.quantity * multiplier))
            adjusted.append(product.model_copy(update={"quantity": new_qty}))

        # Dietary filters
        diet = context.get("diet", "").lower()
        if "veg" in diet and "mixed" not in diet:
            adjusted = [p for p in adjusted if not _is_non_veg(p)]

        # Snack preference filter
        snack_pref = context.get("snack_pref", "").lower()
        if snack_pref == "salty":
            adjusted = [p for p in adjusted if not _is_sweet(p)]
        elif snack_pref == "sweet":
            adjusted = [p for p in adjusted if _is_sweet(p) or p.productId in {"popcorn-001"}]
        elif snack_pref == "healthy":
            adjusted = [p for p in adjusted if p.productId not in {"chips-001", "chocolate-001", "icecream-001"}]

        # Beverage preference for study/work
        beverage = context.get("beverage", "").lower()
        if beverage:
            adjusted = [p for p in adjusted if _matches_beverage(p, beverage)]

        return adjusted or products


def _guest_multiplier(value: str) -> float:
    mapping = {
        "1-2": 0.6,
        "just me": 0.5,
        "2 people": 0.8,
        "3-5": 1.0,
        "3-4 people": 1.0,
        "family (3-4)": 1.2,
        "6-10": 1.8,
        "5+ people": 1.8,
        "10+": 2.5,
    }
    return mapping.get(value.lower(), 1.0)


def _is_non_veg(product: CartProduct) -> bool:
    return product.productId in {"chicken-001", "soup-001"}


def _is_sweet(product: CartProduct) -> bool:
    return product.productId in {
        "chocolate-001",
        "chocolates-001",
        "icecream-001",
        "sweets-001",
    }


def _matches_beverage(product: CartProduct, beverage: str) -> bool:
    beverage_map = {
        "coffee": {"coffee-001", "energybar-001", "water-001"},
        "tea": {"energybar-001", "water-001"},
        "energy bars": {"energybar-001", "water-001"},
        "water": {"water-001"},
    }
    allowed = beverage_map.get(beverage, set())
    if not allowed:
        return True
    # Always keep stationery items
    if product.category == "Stationery":
        return True
    return product.productId in allowed
