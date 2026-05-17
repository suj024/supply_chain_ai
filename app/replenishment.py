import os
import math
import pandas as pd
from datetime import date, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'sales.csv')

def load_sales_data():
    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])
    return df

def recommend_replenishment(product_id, location, current_stock):
    df       = load_sales_data()
    filtered = df[(df['product_id'] == product_id) & (df['location'] == location)]

    if filtered.empty:
        return {"error": f"No data for {product_id} in {location}"}

    avg_demand = float(filtered['sales'].mean())
    std_demand = float(filtered['sales'].std())
    lead_time  = int(filtered['lead_time_days'].mean())
    avg_price  = float(filtered['price'].mean()) if 'price' in filtered.columns else 1000.0

    # Safety stock (95% service level, z=1.65)
    safety_stock  = round(1.65 * std_demand * math.sqrt(lead_time), 0)

    # Reorder point = demand during lead time + safety stock
    reorder_point = round((avg_demand * lead_time) + safety_stock, 2)

    # EOQ = sqrt(2 * annual_demand * ordering_cost / holding_cost)
    annual_demand = avg_demand * 365
    ordering_cost = 500
    holding_cost  = avg_price * 0.20

    eoq = round(math.sqrt((2 * annual_demand * ordering_cost) / holding_cost), 0) if holding_cost > 0 else round(avg_demand * 30, 0)

    days_of_stock  = round(current_stock / avg_demand, 1) if avg_demand > 0 else 999
    should_order   = current_stock <= reorder_point
    order_quantity = max(0, int(eoq)) if should_order else 0

    if days_of_stock < lead_time:
        urgency = "CRITICAL — Order immediately"
    elif days_of_stock < lead_time * 2:
        urgency = "HIGH — Order within 2 days"
    elif current_stock <= reorder_point:
        urgency = "MEDIUM — Reorder point reached"
    else:
        urgency = "LOW — Stock is sufficient"

    suggested_date = (date.today() + timedelta(days=2)).isoformat()

    return {
        "product_id":           product_id,
        "location":             location,
        "current_stock":        current_stock,
        "avg_daily_demand":     round(avg_demand, 2),
        "demand_std":           round(std_demand, 2),
        "lead_time_days":       lead_time,
        "safety_stock":         int(safety_stock),
        "reorder_point":        reorder_point,
        "eoq":                  int(eoq),
        "recommended_order":    order_quantity,
        "days_of_stock_left":   days_of_stock,
        "should_order":         should_order,
        "urgency":              urgency,
        "suggested_order_date": suggested_date,
        "reasoning": (
            f"Avg demand {round(avg_demand,1)} units/day × {lead_time}-day lead time + "
            f"{int(safety_stock)} safety stock = reorder at {reorder_point} units. "
            f"EOQ of {int(eoq)} units minimizes ordering + holding costs."
        )
    }