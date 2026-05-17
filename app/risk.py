import os
import math
import pandas as pd
from datetime import date, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'sales.csv')

SUPPLIER_RELIABILITY = {
    "Laptop":     {"supplier": "Dell Supplies India",    "score": 82, "avg_delay_days": 2, "reliability": "Good"},
    "Mobile":     {"supplier": "Samsung Distributors",   "score": 91, "avg_delay_days": 1, "reliability": "Excellent"},
    "Tablet":     {"supplier": "Apple India Logistics",  "score": 88, "avg_delay_days": 1, "reliability": "Excellent"},
    "Headphones": {"supplier": "Boat Warehouse",         "score": 74, "avg_delay_days": 3, "reliability": "Average"},
    "Smartwatch": {"supplier": "Noise Tech Supplies",    "score": 70, "avg_delay_days": 4, "reliability": "Average"},
    "Keyboard":   {"supplier": "Logitech India Hub",     "score": 95, "avg_delay_days": 1, "reliability": "Excellent"},
    "Monitor":    {"supplier": "LG Electronics India",   "score": 85, "avg_delay_days": 2, "reliability": "Good"},
    "Mouse":      {"supplier": "HP Accessories India",   "score": 90, "avg_delay_days": 1, "reliability": "Excellent"},
    "Printer":    {"supplier": "Canon India Warehouse",  "score": 65, "avg_delay_days": 5, "reliability": "Poor"},
    "Speaker":    {"supplier": "JBL India Logistics",    "score": 78, "avg_delay_days": 3, "reliability": "Average"},
}

def load_sales_data():
    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])
    return df

def compute_risk_score(days_of_stock, lead_time, demand_cv, supplier_score, seasonal_factor):
    coverage_ratio = days_of_stock / max(lead_time, 1)
    if coverage_ratio < 1:       stock_risk = 100
    elif coverage_ratio < 2:     stock_risk = 70
    elif coverage_ratio < 4:     stock_risk = 30
    elif coverage_ratio > 10:    stock_risk = 60
    else:                        stock_risk = 10

    if demand_cv > 0.3:          variability_risk = 80
    elif demand_cv > 0.2:        variability_risk = 50
    elif demand_cv > 0.1:        variability_risk = 25
    else:                        variability_risk = 10

    supplier_risk = max(0, 100 - supplier_score)

    if seasonal_factor > 1.1:    seasonal_risk = 60
    elif seasonal_factor < 0.95: seasonal_risk = 20
    else:                        seasonal_risk = 10

    return round(stock_risk*0.40 + variability_risk*0.20 + supplier_risk*0.25 + seasonal_risk*0.15, 1)

def detect_risk(product_id, location, current_stock):
    df       = load_sales_data()
    filtered = df[(df['product_id'] == product_id) & (df['location'] == location)]

    if filtered.empty:
        return {"error": f"No data for {product_id} in {location}"}

    avg_demand      = float(filtered['sales'].mean())
    std_demand      = float(filtered['sales'].std())
    demand_cv       = std_demand / avg_demand if avg_demand > 0 else 0
    lead_time       = int(filtered['lead_time_days'].mean())
    seasonal_factor = float(filtered['seasonal_factor'].mean())
    days_of_stock   = round(current_stock / avg_demand, 1) if avg_demand > 0 else 999

    supplier_info = SUPPLIER_RELIABILITY.get(product_id, {
        "supplier": "Unknown", "score": 50, "avg_delay_days": 3, "reliability": "Unknown"
    })

    risk_score = compute_risk_score(days_of_stock, lead_time, demand_cv, supplier_info["score"], seasonal_factor)

    if risk_score >= 70:
        risk_level     = "HIGH RISK ⚠️"
        recommendation = "Order stock immediately!"
    elif risk_score >= 45:
        risk_level     = "MEDIUM RISK 🟡"
        recommendation = "Plan replenishment soon."
    elif days_of_stock > lead_time * 6:
        risk_level     = "OVERSTOCK RISK 📦"
        recommendation = "Reduce orders, clear excess stock."
        risk_score     = max(risk_score, 45)
    else:
        risk_level     = "LOW RISK ✅"
        recommendation = "No action needed."

    stockout_prob  = round(1 / (1 + math.exp(-0.08 * (risk_score - 50))) * 100, 1)
    order_by_date  = (date.today() + timedelta(days=2)).isoformat()

    if supplier_info["score"] >= 90:   supplier_risk_flag = "✅ Highly Reliable"
    elif supplier_info["score"] >= 75: supplier_risk_flag = "🟡 Moderately Reliable"
    else:                              supplier_risk_flag = "🔴 Unreliable — Consider backup"

    advance_warning = None
    if days_of_stock < lead_time + 2:
        advance_warning = f"⚠️ Stock runs out in {days_of_stock} days. Order by {order_by_date}."
    elif days_of_stock < lead_time * 2:
        advance_warning = f"🟡 Stock lasts {days_of_stock} days. Suggested order by {order_by_date}."

    return {
        "avg_demand":            round(avg_demand, 2),
        "demand_std":            round(std_demand, 2),
        "demand_cv":             round(demand_cv, 3),
        "seasonal_factor":       round(seasonal_factor, 2),
        "days_of_stock_left":    days_of_stock,
        "lead_time_days":        lead_time,
        "risk_score":            risk_score,
        "stockout_probability":  stockout_prob,
        "risk":                  risk_level,
        "recommendation":        recommendation,
        "order_by_date":         order_by_date,
        "advance_warning":       advance_warning,
        "supplier": {
            "name":           supplier_info["supplier"],
            "reliability":    supplier_info["reliability"],
            "score":          supplier_info["score"],
            "avg_delay_days": supplier_info["avg_delay_days"],
            "risk_flag":      supplier_risk_flag,
        },
        "risk_breakdown": {
            "stock_coverage_days": days_of_stock,
            "demand_variability":  f"{round(demand_cv*100,1)}% CV",
            "supplier_score":      supplier_info["score"],
            "seasonal_pressure":   seasonal_factor,
            "composite_score":     risk_score,
        }
    }