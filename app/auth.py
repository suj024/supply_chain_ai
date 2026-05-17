from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# secret key
SECRET_KEY = "supplychain_secret_key_2025"
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# all users in the system
USERS_DB = {
    # internal users
    "admin": {
        "username": "admin",
        "password": pwd_context.hash("admin123"),
        "role":     "admin",
        "name":     "Admin User",
        "product":  None
    },
    "manager": {
        "username": "manager",
        "password": pwd_context.hash("manager123"),
        "role":     "manager",
        "name":     "Supply Chain Manager",
        "product":  None
    },
    "procurement": {
        "username": "procurement",
        "password": pwd_context.hash("procurement123"),
        "role":     "procurement",
        "name":     "Procurement Team",
        "product":  None
    },
    # suppliers — each sees only their own product orders
    "dell": {
        "username": "dell",
        "password": pwd_context.hash("dell123"),
        "role":     "supplier",
        "name":     "Dell Supplies India",
        "product":  "Laptop"
    },
    "samsung": {
        "username": "samsung",
        "password": pwd_context.hash("samsung123"),
        "role":     "supplier",
        "name":     "Samsung Distributors",
        "product":  "Mobile"
    },
    "apple": {
        "username": "apple",
        "password": pwd_context.hash("apple123"),
        "role":     "supplier",
        "name":     "Apple India Logistics",
        "product":  "Tablet"
    },
    "boat": {
        "username": "boat",
        "password": pwd_context.hash("boat123"),
        "role":     "supplier",
        "name":     "Boat Warehouse",
        "product":  "Headphones"
    },
    "noise": {
        "username": "noise",
        "password": pwd_context.hash("noise123"),
        "role":     "supplier",
        "name":     "Noise Tech Supplies",
        "product":  "Smartwatch"
    },
    "logitech": {
        "username": "logitech",
        "password": pwd_context.hash("logitech123"),
        "role":     "supplier",
        "name":     "Logitech India Hub",
        "product":  "Keyboard"
    },
    "lg": {
        "username": "lg",
        "password": pwd_context.hash("lg123"),
        "role":     "supplier",
        "name":     "LG Electronics India",
        "product":  "Monitor"
    },
    "hp": {
        "username": "hp",
        "password": pwd_context.hash("hp123"),
        "role":     "supplier",
        "name":     "HP Accessories India",
        "product":  "Mouse"
    },
}


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str):
    user = USERS_DB.get(username)
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None
    return user


def create_access_token(data: dict):
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = USERS_DB.get(username)
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception