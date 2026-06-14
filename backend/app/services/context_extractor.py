import re
from typing import Optional


def _extract_number(text: str) -> Optional[int]:
    """Find the first number in the text that looks like a count."""
    # Look for patterns like '5 guests', '3 people', '10+'
    match = re.search(r'(\d+)\s*(?:\+)?', text)
    if match:
        return int(match.group(1))
    # Word numbers
    word_numbers = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    }
    lowered = text.lower()
    for word, num in word_numbers.items():
        if re.search(r'\b' + word + r'\b', lowered):
            return num
    return None


def _map_count_to_range(count: int) -> str:
    if count <= 2:
        return "1-2"
    if count <= 5:
        return "3-5"
    if count <= 10:
        return "6-10"
    return "10+"


def _map_people_range(count: int) -> str:
    if count == 1:
        return "Just me"
    if count == 2:
        return "2 people"
    if count <= 4:
        return "3-4 people"
    return "5+ people"


def _map_family_range(count: int) -> str:
    if count == 1:
        return "1 person"
    if count == 2:
        return "2 people"
    if count <= 4:
        return "Family (3-4)"
    return "5+ people"


def extract_context_from_query(query: str) -> dict:
    """Scan the user query and extract implied answers to clarifying questions."""
    normalized = query.lower()
    context: dict = {}

    # Festival detection
    if any(word in normalized for word in ["rakhi", "raksha bandhan"]):
        context["festival"] = "Raksha Bandhan"
    elif "diwali" in normalized:
        context["festival"] = "Diwali"
    elif any(word in normalized for word in ["holi", "eid", "christmas", "new year"]):
        context["festival"] = "Other"

    # Room detection
    if "bedroom" in normalized:
        context["room"] = "Bedroom"
    elif "living room" in normalized:
        context["room"] = "Living room"
    elif "study" in normalized or "office" in normalized:
        context["room"] = "Study"
    elif "balcony" in normalized:
        context["room"] = "Balcony"

    # Vibe detection
    if any(word in normalized for word in ["cozy", "warm", "comfortable"]):
        context["vibe"] = "Cozy / warm"
    elif any(word in normalized for word in ["aesthetic", "modern", "minimal"]):
        context["vibe"] = "Aesthetic / modern"
    elif any(word in normalized for word in ["colorful", "festive", "bright"]):
        context["vibe"] = "Colorful / festive"

    # Diet detection
    if any(word in normalized for word in ["vegetarian", "veg"]):
        context["diet"] = "Vegetarian"
    elif "vegan" in normalized:
        context["diet"] = "Vegan"
    elif "gluten-free" in normalized or "gluten free" in normalized:
        context["diet"] = "Gluten-free"
    elif any(word in normalized for word in ["non-veg", "non veg", "chicken", "mutton"]):
        context["diet"] = "Non-veg only"

    # Snack preference
    if any(word in normalized for word in ["salty", "savory", "spicy"]):
        context["snack_pref"] = "Salty"
    elif any(word in normalized for word in ["sweet", "dessert", "chocolate"]):
        context["snack_pref"] = "Sweet"
    elif any(word in normalized for word in ["healthy", "fruits", "nuts"]):
        context["snack_pref"] = "Healthy"

    # Beverage preference
    if "coffee" in normalized:
        context["beverage"] = "Coffee"
    elif "tea" in normalized:
        context["beverage"] = "Tea"
    elif "energy" in normalized:
        context["beverage"] = "Energy bars"

    # Setup type
    if any(word in normalized for word in ["moving", "shift", "new apartment", "new home"]):
        context["setup_type"] = "Moving in"
    elif any(word in normalized for word in ["deep clean", "deep cleaning"]):
        context["setup_type"] = "Deep clean"
    elif any(word in normalized for word in ["restock", "refill", "groceries"]):
        context["setup_type"] = "Restock essentials"

    # Cleaning area
    if "kitchen" in normalized:
        context["area"] = "Kitchen"
    elif "bathroom" in normalized:
        context["area"] = "Bathroom"
    elif "living room" in normalized:
        context["area"] = "Living room"
    elif any(word in normalized for word in ["full house", "whole house", "entire house"]):
        context["area"] = "Full house"

    # Cleaning level
    if any(word in normalized for word in ["deep clean", "very messy", "disaster"]):
        context["level"] = "Deep clean needed"
    elif any(word in normalized for word in ["moderate", "somewhat messy", "quite messy"]):
        context["level"] = "Moderate"
    elif any(word in normalized for word in ["light", "tidy up", "quick clean"]):
        context["level"] = "Light tidy up"

    # Baby age
    if any(word in normalized for word in ["newborn", "0-3", "just born", "few weeks"]):
        context["baby_age"] = "Newborn (0-3 months)"
    elif any(word in normalized for word in ["infant", "3-12", "6 months", "9 months"]):
        context["baby_age"] = "Infant (3-12 months)"
    elif any(word in normalized for word in ["toddler", "1 year", "2 year", "1-3"]):
        context["baby_age"] = "Toddler (1-3 years)"

    # Priority
    if any(word in normalized for word in ["travel", "trip", "going out"]):
        context["priority"] = "Travel kit"
    elif any(word in normalized for word in ["sick", "fever", "unwell", "not well"]):
        context["priority"] = "Sick care"
    elif any(word in normalized for word in ["daily", "everyday", "regular"]):
        context["priority"] = "Daily essentials"

    # Patient
    if any(word in normalized for word in ["child", "kid", "baby", "daughter", "son"]):
        context["patient"] = "Child"
    elif any(word in normalized for word in ["senior", "elderly", "grandpa", "grandma", "parents"]):
        context["patient"] = "Senior"
    elif any(word in normalized for word in ["adult", "me", "myself", "friend"]):
        context["patient"] = "Adult"

    # Symptoms
    if any(word in normalized for word in ["fever", "temperature", "hot"]):
        context["symptoms"] = "Fever"
    elif any(word in normalized for word in ["cold", "cough", "sneeze", "flu"]):
        context["symptoms"] = "Cold & cough"
    elif any(word in normalized for word in ["stomach", "vomit", "diarrhea", "loose motion"]):
        context["symptoms"] = "Stomach issues"
    elif any(word in normalized for word in ["headache", "body pain", "pain"]):
        context["symptoms"] = "Headache / body pain"

    # Session length
    if any(word in normalized for word in ["all nighter", "all night", "whole night"]):
        context["session"] = "All nighter"
    elif any(word in normalized for word in ["full day", "work day", "entire day"]):
        context["session"] = "Full work day"
    elif any(word in normalized for word in ["few hours", "couple hours", "short"]):
        context["session"] = "Few hours"

    # Occasion
    if any(word in normalized for word in ["birthday", "bday"]):
        context["occasion"] = "Birthday"
    elif any(word in normalized for word in ["formal", "dinner party", "fancy"]):
        context["occasion"] = "Formal dinner"
    elif any(word in normalized for word in ["house party", "party night", "drinks"]):
        context["occasion"] = "House party"

    # Count detection for guests/people
    count = _extract_number(query)
    if count is not None:
        # Only set if we haven't already set a more specific one
        if "guest_count" not in context and "people" not in context:
            context["guest_count"] = _map_count_to_range(count)
            context["people"] = _map_people_range(count)

    return context
