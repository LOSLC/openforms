from fastapi import APIRouter

from app.api.routes.v1.controllers.auth import router as auth_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
