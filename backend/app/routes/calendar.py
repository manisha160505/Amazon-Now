from datetime import datetime, timedelta
from fastapi import APIRouter

router = APIRouter(tags=["calendar"])


@router.get("/calendar-events")
def get_calendar_events():
    """Return upcoming calendar events with suggested Flash Mode queries and context."""
    today = datetime.now()
    events = [
        {
            "id": "1",
            "title": "Mom's Birthday",
            "date": (today + timedelta(days=2)).strftime("%A, %d %B"),
            "daysLeft": 2,
            "type": "birthday",
            "suggestedQuery": "Mom's birthday celebration at home",
            "context": {
                "guest_count": "3-5",
                "diet": "Mixed",
                "occasion": "Birthday",
            },
        },
        {
            "id": "2",
            "title": "Housewarming Party",
            "date": (today + timedelta(days=6)).strftime("%A, %d %B"),
            "daysLeft": 6,
            "type": "party",
            "suggestedQuery": "Guests are coming for housewarming party",
            "context": {
                "guest_count": "6-10",
                "diet": "Mixed",
                "occasion": "House party",
            },
        },
        {
            "id": "3",
            "title": "Goa Trip",
            "date": (today + timedelta(days=12)).strftime("%A, %d %B"),
            "daysLeft": 12,
            "type": "trip",
            "suggestedQuery": "Going on a trip need essentials",
            "context": {},
        },
        {
            "id": "4",
            "title": "Raksha Bandhan",
            "date": (today + timedelta(days=65)).strftime("%A, %d %B"),
            "daysLeft": 65,
            "type": "festival",
            "suggestedQuery": "Rakhi celebration at home",
            "context": {
                "festival": "Raksha Bandhan",
                "people": "3-5",
            },
        },
    ]
    return events
