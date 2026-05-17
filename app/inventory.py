import os
import math
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'sales.csv')

def load_sales_data():
    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])
    return df

def check_inventory(product_id, location, stock):
    df       = load_sales_data()
    filtered = df[(df['product_id'] == product_id) & (df['location'] == location)]

    if filtered.empty:
        return {"error": f"No data for {product_id} in {location}"}

    avg_demand      = float(filtered['sales'].mean())
    std_demand      = float(filtered['sales'].std())
    lead_time       = int(filtered['lead_time_days'].mean())
    seasonal_factor = float(filtered['seasonal_factor'].mean())

    safety_stock  = round(1.65 * std_demand * math.sqrt(lead_time), 0)
    reorder_point = round((avg_demand * lead_time) + safety_stock, 2)
    max_stock     = round((avg_demand * 30) + safety_stock, 0)
    days_remaining = round(stock / avg_demand, 1) if avg_demand > 0 else 999

    if stock < safety_stock:
        status  = "CRITICAL"
        message = f"Below safety stock! Order {int(reorder_point - stock)} units immediately."
    elif stock < reorder_point:
        status  = "UNDERSTOCK"
        message = f"Below reorder point. Order soon to avoid stockout."
    elif stock > max_stock:
        status  = "OVERSTOCK"
        message = f"Excess stock detected. Reduce next order quantity."
    else:
        status  = "HEALTHY"
        message = f"Stock levels are optimal."

    return {
        "product_id":      product_id,
        "location":        location,
        "current_stock":   stock,
        "avg_demand":      round(avg_demand, 2),
        "std_demand":      round(std_demand, 2),
        "lead_time_days":  lead_time,
        "safety_stock":    int(safety_stock),
        "reorder_point":   reorder_point,
        "max_stock":       int(max_stock),
        "days_remaining":  days_remaining,
        "seasonal_factor": round(seasonal_factor, 2),
        "status":          status,
        "message":         message,
    }