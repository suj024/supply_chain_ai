from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Sales(Base):
    __tablename__ = "sales"

    id                      = Column(Integer, primary_key=True, index=True)
    date                    = Column(Date)
    product_id              = Column(String)
    location                = Column(String)
    sales                   = Column(Float)
    price                   = Column(Float)
    revenue                 = Column(Float)
    inventory_level         = Column(Integer)
    reorder_level           = Column(Integer)
    replenishment_triggered = Column(Integer)
    stock_out_risk          = Column(Integer)
    lead_time_days          = Column(Integer)
    is_promotion            = Column(Integer)
    promotion_discount_pct  = Column(Float)
    seasonal_factor         = Column(Float)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id             = Column(String, primary_key=True)
    product_id     = Column(String)
    location       = Column(String)
    quantity       = Column(Integer)
    suggested_date = Column(String)
    reason         = Column(String)
    status         = Column(String, default="Pending")
    created_at     = Column(String)
    approved_at    = Column(String, nullable=True)
    rejected_at    = Column(String, nullable=True)