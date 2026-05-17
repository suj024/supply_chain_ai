from app.data_loader import load_sales_data

def simulate_promotion(product_id, location, lift_percent):

    df = load_sales_data()

    df = df[(df['product_id'] == product_id) &
            (df['location'] == location)]

    # average demand
    avg_demand = df['sales'].mean()

    # increase demand based on promotion
    new_demand = avg_demand * (1 + lift_percent / 100)

    return {
        "base_demand": avg_demand,
        "promotion_lift_percent": lift_percent,
        "predicted_demand_after_promotion": new_demand
    }