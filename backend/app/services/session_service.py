from datetime import datetime, timezone
from typing import List, Dict, Any
from collections import Counter
from app.config import get_settings
from app.models import GenerateCartResponse

settings = get_settings()

# In-memory session store for local development
_local_sessions: List[Dict[str, Any]] = []


def log_session(session_id: str, query: str, cart: GenerateCartResponse) -> None:
    """Log a generated cart session."""
    record = {
        "sessionId": session_id,
        "query": query,
        "generatedBundle": cart.model_dump(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    if settings.is_local and not settings.LOCAL_DYNAMODB_URL:
        _local_sessions.append(record)
        return

    import boto3
    if settings.LOCAL_DYNAMODB_URL:
        dynamodb = boto3.resource("dynamodb", endpoint_url=settings.LOCAL_DYNAMODB_URL)
    else:
        dynamodb = boto3.resource("dynamodb", region_name=settings.AWS_REGION)

    table = dynamodb.Table(settings.SESSIONS_TABLE)
    table.put_item(Item=record)


def get_recent_sessions(limit: int = 50) -> List[Dict[str, Any]]:
    """Get recent sessions to power recommendations."""
    if settings.is_local and not settings.LOCAL_DYNAMODB_URL:
        return sorted(_local_sessions, key=lambda x: x["timestamp"], reverse=True)[:limit]

    import boto3
    if settings.LOCAL_DYNAMODB_URL:
        dynamodb = boto3.resource("dynamodb", endpoint_url=settings.LOCAL_DYNAMODB_URL)
    else:
        dynamodb = boto3.resource("dynamodb", region_name=settings.AWS_REGION)

    table = dynamodb.Table(settings.SESSIONS_TABLE)
    response = table.scan(Limit=limit)
    return sorted(response.get("Items", []), key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]


def get_trending_bundle_ids(limit: int = 5) -> List[str]:
    """Return most frequently generated bundle IDs."""
    sessions = get_recent_sessions(limit=200)
    bundle_ids = [s["generatedBundle"].get("bundleId", "") for s in sessions if s.get("generatedBundle")]
    bundle_ids = [b for b in bundle_ids if b]
    counts = Counter(bundle_ids)
    return [b for b, _ in counts.most_common(limit)]


def get_recent_search_queries(limit: int = 5) -> List[str]:
    """Return recent unique search queries."""
    sessions = get_recent_sessions(limit=200)
    seen = set()
    queries = []
    for s in sessions:
        q = s.get("query", "")
        if q and q not in seen:
            seen.add(q)
            queries.append(q)
        if len(queries) >= limit:
            break
    return queries
