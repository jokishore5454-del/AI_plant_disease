from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserAdminCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"

class UserAdminUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_disease_predictions: int
    total_health_predictions: int
    total_yield_predictions: int
    total_predictions: int
    models_status: Dict[str, str]
    system_health: str
