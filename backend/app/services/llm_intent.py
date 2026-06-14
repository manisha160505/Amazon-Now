import json
from typing import Optional
from app.config import get_settings
from app.models import Bundle
from app.data.store import get_store

settings = get_settings()

SYSTEM_PROMPT = """You are the intent classifier for Amazon Flash Mode, a quick-commerce feature that turns a customer's situation into a ready-to-buy product bundle.

Your job: pick the ONE bundle that best matches the user's described situation. Do not invent new bundles. Do not add explanations. Return ONLY a JSON object.

Available bundles and what they contain:
{}

Instructions:
- Choose the bundleId that is most directly relevant to the user's immediate need.
- Be conservative: if the situation is ambiguous or does not clearly fit any bundle, return an empty bundleId and low confidence.
- Do not match based on single unrelated words. The overall situation must clearly belong to the bundle.
- Confidence must be between 0 and 1. Use 0.8+ only when the match is obvious. Use 0.3-0.7 for partial matches. Below 0.3 means no match.

Response format (strict JSON, no markdown):
{{"bundleId": "<exact-bundle-id-or-empty>", "confidence": 0.0}}
"""


def _build_bundle_list() -> str:
    store = get_store()
    lines = []
    for bundle in store.list_bundles():
        product_names = []
        for item in bundle.products:
            product = store.get_product(item.productId)
            if product:
                product_names.append(product.productName)
        lines.append(
            f"- {bundle.bundleId} ({bundle.bundleName}): {', '.join(product_names)}"
        )
    return "\n".join(lines)


def detect_intent_with_llm(query: str) -> Optional[Bundle]:
    """Fallback intent detection using Groq LLM."""
    if not settings.GROQ_API_KEY:
        return None

    try:
        from groq import Groq
    except ImportError:
        return None

    client = Groq(api_key=settings.GROQ_API_KEY)
    prompt = SYSTEM_PROMPT.format(_build_bundle_list())

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query},
            ],
            temperature=0.05,
            max_tokens=120,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        if not content:
            return None

        parsed = json.loads(content)
        bundle_id = parsed.get("bundleId", "").strip()
        confidence = float(parsed.get("confidence", 0.0))

        if not bundle_id or confidence < 0.55:
            return None

        store = get_store()
        return store.get_bundle(bundle_id)
    except Exception as e:
        print(f"LLM intent detection failed: {e}")
        return None
