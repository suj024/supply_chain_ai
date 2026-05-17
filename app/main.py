from app.models import Sales, Base, PurchaseOrder
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from app.auth import authenticate_user, create_access_token, get_current_user
from app.external_signals import get_external_signals
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import SessionLocal, engine
from app.forecast import forecast_demand
from app.inventory import check_inventory
from app.replenishment import recommend_replenishment
from app.risk import detect_risk
from app.promotion import simulate_promotion


app = FastAPI(
    title="Supply Chain AI Platform",
    description="Supply Chain Forecasting System",
    version="1.0.0"
)


def daily_refresh():
    print("🔄 Daily forecast refresh running...")


scheduler = BackgroundScheduler()
scheduler.add_job(daily_refresh, 'cron', hour=1, minute=0)
scheduler.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Supply Chain AI Running 🚀"}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user["username"]})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "name":         user["name"],
        "role":         user["role"],
        "product":      user["product"]
    }


@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "name":     current_user["name"],
        "role":     current_user["role"],
        "product":  current_user["product"]
    }


@app.get("/forecast")
def forecast_api(product_id: str, location: str, days: int = 7):
    try:
        result           = forecast_demand(product_id, location, days)
        forecast_values  = [r["value"] for r in result]
        forecast_with_ci = result
        return {
            "product_id":  product_id,
            "location":    location,
            "days":        days,
            "forecast":    forecast_values,
            "forecast_ci": forecast_with_ci,
            "summary": {
                "avg":   round(sum(forecast_values) / len(forecast_values), 2) if forecast_values else 0,
                "peak":  round(max(forecast_values), 2) if forecast_values else 0,
                "low":   round(min(forecast_values), 2) if forecast_values else 0,
                "total": round(sum(forecast_values), 2) if forecast_values else 0,
            }
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/inventory")
def inventory_api(product_id: str, location: str, stock: int):
    try:
        return check_inventory(product_id, location, stock)
    except Exception as e:
        return {"error": str(e)}


@app.get("/replenish")
def replenish_api(product_id: str, location: str, stock: int):
    try:
        return recommend_replenishment(product_id, location, stock)
    except Exception as e:
        return {"error": str(e)}


@app.get("/risk")
def risk_api(product_id: str, location: str, stock: int):
    try:
        return detect_risk(product_id, location, stock)
    except Exception as e:
        return {"error": str(e)}


@app.get("/promotion")
def promotion_api(product_id: str, location: str, lift: int):
    try:
        return simulate_promotion(product_id, location, lift)
    except Exception as e:
        return {"error": str(e)}


class PurchaseOrderInput(BaseModel):
    product_id:     str
    location:       str
    quantity:       int
    suggested_date: str
    reason:         str


@app.post("/orders/create")
def create_order(order: PurchaseOrderInput):
    db = SessionLocal()
    count = db.query(PurchaseOrder).count()
    new_order = PurchaseOrder(
        id             = f"PO-{count+1:03d}",
        product_id     = order.product_id,
        location       = order.location,
        quantity       = order.quantity,
        suggested_date = order.suggested_date,
        reason         = order.reason,
        status         = "Pending",
        created_at     = datetime.now().isoformat(),
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    db.close()
    return new_order


@app.get("/orders/list")
def list_orders(status: Optional[str] = None):
    db = SessionLocal()
    query = db.query(PurchaseOrder)
    if status:
        query = query.filter(PurchaseOrder.status == status)
    orders = query.all()
    db.close()
    return orders


@app.put("/orders/{order_id}/approve")
def approve_order(order_id: str):
    db = SessionLocal()
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        db.close()
        return {"error": "Order not found"}
    order.status      = "Approved"
    order.approved_at = datetime.now().isoformat()
    db.commit()
    db.close()
    return order


@app.put("/orders/{order_id}/reject")
def reject_order(order_id: str):
    db = SessionLocal()
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        db.close()
        return {"error": "Order not found"}
    order.status      = "Rejected"
    order.rejected_at = datetime.now().isoformat()
    db.commit()
    db.close()
    return order


@app.put("/orders/{order_id}/edit")
def edit_order(order_id: str, order: PurchaseOrderInput):
    db = SessionLocal()
    o = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not o:
        db.close()
        return {"error": "Order not found"}
    o.product_id     = order.product_id
    o.location       = order.location
    o.quantity       = order.quantity
    o.suggested_date = order.suggested_date
    o.reason         = order.reason
    db.commit()
    db.close()
    return o


@app.delete("/orders/{order_id}/delete")
def delete_order(order_id: str):
    db = SessionLocal()
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        db.close()
        return {"error": "Order not found"}
    db.delete(order)
    db.commit()
    db.close()
    return {"message": f"Order {order_id} deleted successfully"}


@app.get("/orders/summary")
def orders_summary():
    db = SessionLocal()
    total    = db.query(PurchaseOrder).count()
    pending  = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Pending").count()
    approved = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Approved").count()
    rejected = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Rejected").count()
    db.close()
    return {"total": total, "pending": pending, "approved": approved, "rejected": rejected}


class ActualSalesInput(BaseModel):
    product_id: str
    location:   str
    date:       str
    actual:     float
    predicted:  float


actual_sales_log = []


def _calc_mape(actual: float, predicted: float) -> float:
    if actual == 0:
        return 0.0
    return round(abs(actual - predicted) / actual * 100, 2)


def _calc_accuracy(mape: float) -> float:
    return round(max(0.0, 100.0 - mape), 2)


@app.post("/accuracy/log")
def log_accuracy(data: ActualSalesInput):
    mape     = _calc_mape(data.actual, data.predicted)
    accuracy = _calc_accuracy(mape)
    record = {
        "product_id":   data.product_id,
        "location":     data.location,
        "date":         data.date,
        "actual":       round(data.actual, 2),
        "predicted":    round(data.predicted, 2),
        "error":        round(abs(data.actual - data.predicted), 2),
        "mape":         mape,
        "accuracy_pct": accuracy,
        "logged_at":    datetime.now().isoformat(),
    }
    actual_sales_log.append(record)
    return {"message": "Logged ✅", "record": record}


@app.get("/accuracy/report")
def accuracy_report(product_id: str, location: str):
    filtered = [
        r for r in actual_sales_log
        if r["product_id"] == product_id and r["location"] == location
    ]
    if not filtered:
        return {"product_id": product_id, "location": location, "records": [],
                "avg_accuracy": 0, "avg_error": 0, "avg_mape": 0, "total_records": 0}

    avg_accuracy = round(sum(r["accuracy_pct"] for r in filtered) / len(filtered), 2)
    avg_error    = round(sum(r["error"]        for r in filtered) / len(filtered), 2)
    avg_mape     = round(sum(r["mape"]         for r in filtered) / len(filtered), 2)
    best         = max(filtered, key=lambda r: r["accuracy_pct"])
    worst        = min(filtered, key=lambda r: r["accuracy_pct"])

    return {
        "product_id": product_id, "location": location, "records": filtered,
        "total_records": len(filtered), "avg_accuracy": avg_accuracy,
        "avg_error": avg_error, "avg_mape": avg_mape,
        "best_day":  {"date": best["date"],  "accuracy": best["accuracy_pct"]},
        "worst_day": {"date": worst["date"], "accuracy": worst["accuracy_pct"]},
    }


@app.get("/accuracy/all")
def accuracy_all():
    if not actual_sales_log:
        return {"records": [], "total": 0}
    overall_accuracy = round(
        sum(r["accuracy_pct"] for r in actual_sales_log) / len(actual_sales_log), 2
    )
    return {"total": len(actual_sales_log), "overall_accuracy": overall_accuracy,
            "records": actual_sales_log}


@app.delete("/accuracy/clear")
def clear_accuracy_log():
    actual_sales_log.clear()
    return {"message": "Accuracy log cleared ✅"}


@app.get("/suppliers")
def get_suppliers():
    from app.risk import SUPPLIER_RELIABILITY
    suppliers = []
    for product, info in SUPPLIER_RELIABILITY.items():
        suppliers.append({
            "product":     product,
            "supplier":    info["supplier"],
            "reliability": info["reliability"],
            "score":       info["score"],
            "avg_delay":   info["avg_delay_days"],
            "status":      "Active" if info["score"] >= 70 else "Inactive"
        })
    return {"total": len(suppliers), "suppliers": suppliers}


@app.get("/signals")
def signals_api(product_id: str, location: str):
    try:
        return get_external_signals(product_id, location)
    except Exception as e:
        return {"error": str(e)}


Base.metadata.create_all(bind=engine)


class SalesInput(BaseModel):
    product_id: str
    location:   str
    sales:      float


@app.post("/add-data")
def add_data(data: SalesInput):
    db = SessionLocal()
    new_record = Sales(
        product_id=data.product_id,
        location=data.location,
        sales=data.sales
    )
    db.add(new_record)
    db.commit()
    db.close()
    return {"message": "Data added successfully ✅"}