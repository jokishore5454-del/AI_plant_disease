from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.auth import Token, UserResponse, LoginRequest, UserCreate
from app.api.deps import get_current_user
from app.utils.logger import log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username)
    ).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        log_activity(db, user_id=user.id if user else None, username=login_data.username, action="LOGIN_FAILED", status="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    if not user.is_active:
        log_activity(db, user_id=user.id, username=user.username, action="LOGIN_DISABLED_ACCOUNT", status="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is disabled. Contact system administrator."
        )

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    log_activity(db, user_id=user.id, username=user.username, action="USER_LOGIN_SUCCESS", status="SUCCESS")

    access_token = create_access_token(data={"sub": user.username, "role": user.role, "user_id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or Email is already registered."
        )

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_pw,
        role="user",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_activity(db, user_id=new_user.id, username=new_user.username, action="USER_REGISTRATION", status="SUCCESS")
    return new_user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_activity(db, user_id=current_user.id, username=current_user.username, action="USER_LOGOUT", status="SUCCESS")
    return {"message": "Successfully logged out."}
