import json
import os

# ↓ Load signals from JSON file instead of hardcoding
_file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'signals.json')

with open(_file_path) as f:
    _data = json.load(f)

WEATHER_SIGNALS    = _data["weather"]
FESTIVAL_SIGNALS   = _data["festivals"]
COMPETITOR_SIGNALS = _data["competitors"]


def get_external_signals(product_id, location):
    weather    = WEATHER_SIGNALS.get(location, {
        "event": "No data", "impact": "normal", "factor": 1.0
    })
    festival   = FESTIVAL_SIGNALS.get(location, {
        "event": "No festival", "impact": "normal", "factor": 1.0
    })
    competitor = COMPETITOR_SIGNALS.get(product_id, {
        "competitor": "No data", "promo": "None", "impact": "normal", "factor": 1.0
    })

    # combined impact factor
    combined_factor = round(
        weather["factor"] * festival["factor"] * competitor["factor"], 3
    )

    return {
        "weather": {
            "event":  weather["event"],
            "impact": weather["impact"],
            "factor": weather["factor"],
        },
        "festival": {
            "event":  festival["event"],
            "impact": festival["impact"],
            "factor": festival["factor"],
        },
        "competitor": {
            "name":   competitor["competitor"],
            "promo":  competitor["promo"],
            "impact": competitor["impact"],
            "factor": competitor["factor"],
        },
        "combined_demand_factor": combined_factor,
        "adjusted_demand_note": (
            "Demand likely HIGH due to festival season 🎉" if combined_factor > 1.2 else
            "Demand likely LOW due to weather/competition 🌧️" if combined_factor < 0.85 else
            "Demand is NORMAL 📊"
        )
    }