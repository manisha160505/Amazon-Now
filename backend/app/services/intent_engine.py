from typing import Optional
from app.models import Bundle
from app.data.store import get_store
from app.services.llm_intent import detect_intent_with_llm


class IntentResult:
    def __init__(self, intent: str, urgency: str, category: str, bundle: Bundle, confidence: float):
        self.intent = intent
        self.urgency = urgency
        self.category = category
        self.bundle = bundle
        self.confidence = confidence


def _normalize(text: str) -> str:
    """Lowercase and strip punctuation."""
    return ''.join(c for c in text.lower() if c.isalnum() or c.isspace()).strip()


# Words too short/common to use for substring matching
_STOPWORDS = {"a", "an", "the", "i", "we", "you", "to", "is", "am", "are", "was", "were",
              "in", "on", "at", "of", "for", "with", "and", "or", "but", "my", "me", "it",
              "its", "have", "has", "had", "do", "does", "did", "want", "need", "like"}


def _rule_based_detect(query: str, bundles: list[Bundle]) -> Optional[IntentResult]:
    """Score bundles by keyword overlap with the user query.

    Multi-word keywords and multiple distinct keyword matches score higher.
    Very short or stop words are ignored for loose substring matching.
    """
    normalized = _normalize(query)
    query_words = [w for w in normalized.split() if len(w) > 1 and w not in _STOPWORDS]
    best_bundle: Optional[Bundle] = None
    best_score = 0

    for bundle in bundles:
        score = 0
        for keyword in bundle.keywords:
            keyword_clean = _normalize(keyword)
            if not keyword_clean:
                continue

            # Full keyword phrase appears in query (strong signal)
            if keyword_clean in normalized:
                score += (len(keyword_clean.split()) * 2) + 1
                continue

            # Word-level overlap
            keyword_parts = [p for p in keyword_clean.split() if p not in _STOPWORDS and len(p) > 1]
            for part in keyword_parts:
                for word in query_words:
                    if part == word:
                        score += 2
                    elif len(part) >= 3 and len(word) >= 3 and (part in word or word in part):
                        score += 1

        if score > best_score:
            best_score = score
            best_bundle = bundle

    if best_bundle is None:
        return None

    confidence = min(0.95, 0.5 + (best_score * 0.05))
    return IntentResult(
        intent=best_bundle.intent,
        urgency=best_bundle.urgency,
        category=best_bundle.category,
        bundle=best_bundle,
        confidence=confidence,
    )


def _get_fallback_bundle(bundles: list[Bundle]) -> Bundle:
    """Return the general essentials bundle as a safe fallback."""
    for bundle in bundles:
        if bundle.bundleId == "general-essentials-kit":
            return bundle
    # If no fallback bundle exists, return the first bundle (should not happen)
    return bundles[0]


def detect_intent(query: str) -> IntentResult:
    """Hybrid intent detection with a guaranteed fallback bundle.

    1. Try fast rule-based keyword matching first.
    2. If no match, fall back to Groq LLM (if GROQ_API_KEY is set).
    3. If still no match, return the general essentials fallback bundle.

    Future: replace the rule/LLM combo with Amazon Bedrock without changing
    the return type.
    """
    store = get_store()
    bundles = store.list_bundles()

    # Step 1: rule-based
    result = _rule_based_detect(query, bundles)
    if result is not None:
        return result

    # Step 2: LLM fallback
    bundle = detect_intent_with_llm(query)
    if bundle is not None:
        return IntentResult(
            intent=bundle.intent,
            urgency=bundle.urgency,
            category=bundle.category,
            bundle=bundle,
            confidence=0.75,
        )

    # Step 3: guaranteed fallback so every query gets a cart
    fallback = _get_fallback_bundle(bundles)
    return IntentResult(
        intent=fallback.intent,
        urgency=fallback.urgency,
        category=fallback.category,
        bundle=fallback,
        confidence=0.4,
    )
