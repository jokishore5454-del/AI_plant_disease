from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.logs import AIQuery
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.services.ai_service import ai_service
from app.utils.logger import log_activity

router = APIRouter(prefix="/ai", tags=["AI Agricultural Assistant"])

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        explanation = await ai_service.get_explanation(
            question=req.question,
            prediction_type=req.prediction_type or "general",
            context=req.prediction_context
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Assistant service error: {str(e)}"
        )

    # Record AI query in DB
    query_record = AIQuery(
        user_id=current_user.id,
        question=req.question,
        response=explanation
    )
    db.add(query_record)
    db.commit()

    log_activity(db, user_id=current_user.id, username=current_user.username, action="AI_ASSISTANT_QUERY", status="SUCCESS")

    return {
        "question": req.question,
        "response": explanation,
        "source": "AgriVision AI Senior Agronomist Assistant"
    }

@router.get("/history")
def get_ai_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    queries = db.query(AIQuery).filter(AIQuery.user_id == current_user.id).order_by(AIQuery.created_at.desc()).limit(20).all()
    return queries
