from pydantic import BaseModel
from typing import Optional, Dict, Any

class AIChatRequest(BaseModel):
    question: str
    prediction_type: Optional[str] = None # 'disease', 'health', 'yield', or 'general'
    prediction_context: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    question: str
    response: str
    source: str = "AgriVision AI Assistant"
