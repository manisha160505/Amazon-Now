from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_generate_cart_fever():
    response = client.post("/generate-cart", json={
        "query": "I have a fever",
        "context": {"patient": "Adult", "symptoms": "Fever"},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Recovery Kit"
    assert data["intent"] == "Fever"
    assert data["urgency"] == "High"
    assert len(data["products"]) > 0
    assert data["total"] > 0


def test_generate_cart_questions():
    response = client.post("/generate-cart", json={"query": "Guests are coming"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Party Kit"
    assert data["questions"] is not None
    assert len(data["questions"]) > 0
    assert data["questions"][0]["text"] == "How many guests are coming?"


def test_generate_cart_skips_already_answered_questions():
    # "Rakhi" is in the query, so the festival question should be skipped.
    response = client.post("/generate-cart", json={"query": "I forgot tomorrow is Rakhi"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Festival Celebration Kit"
    # Festival question should be removed
    question_ids = [q["id"] for q in data.get("questions", [])]
    assert "festival" not in question_ids
    # But people question should still be asked
    assert "people" in question_ids
    # Prefilled context should contain Raksha Bandhan
    assert data["prefilledContext"]["festival"] == "Raksha Bandhan"


def test_generate_cart_party():
    response = client.post("/generate-cart", json={"query": "Guests are coming in 30 minutes"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Party Kit"


def test_generate_cart_pasta():
    response = client.post("/generate-cart", json={"query": "I want to make pasta tonight"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Pasta Night Kit"


def test_generate_cart_movie():
    response = client.post("/generate-cart", json={"query": "I need snacks for movie night"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Movie Night Kit"


def test_generate_cart_apartment():
    response = client.post("/generate-cart", json={"query": "I am moving into a new apartment"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Home Setup Kit"


def test_generate_cart_unknown():
    response = client.post("/generate-cart", json={"query": "xyzabc123 nothing matches"})
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "General Essentials Kit"
    assert len(data["products"]) > 0


def test_list_bundles():
    response = client.get("/bundles")
    assert response.status_code == 200
    assert len(response.json()) >= 5


def test_list_products():
    response = client.get("/products")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_add_bundle_to_cart():
    response = client.post("/add-bundle-to-cart", json={"bundleId": "recovery-kit"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_calendar_events():
    response = client.get("/calendar-events")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    assert data[0]["title"] == "Mom's Birthday"
    assert "daysLeft" in data[0]
    assert "suggestedQuery" in data[0]


def test_generate_cart_room_decor():
    response = client.post("/generate-cart", json={
        "query": "I want to decorate my room",
        "context": {"room": "Bedroom", "vibe": "Cozy / warm"},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["bundle"] == "Room Decor Kit"
    assert data["intent"] == "Room Decoration"
    assert len(data["products"]) > 0
    assert data["total"] > 0


def test_generate_cart_with_budget():
    context = {"guest_count": "3-5", "diet": "Mixed", "occasion": "Casual hangout"}

    # Full party kit is more than 200; with budget it should fit within 200
    response = client.post("/generate-cart", json={
        "query": "Guests are coming over",
        "budget": 200,
        "context": context,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total"] <= 200
    assert len(data["products"]) > 0

    # Very low budget should still return at least one cheapest item
    response = client.post("/generate-cart", json={
        "query": "Guests are coming over",
        "budget": 50,
        "context": context,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total"] <= 50
    assert len(data["products"]) >= 1
