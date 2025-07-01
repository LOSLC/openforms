from datetime import datetime, timezone
from typing import Annotated

from fastapi import Cookie, Depends, Response
from pydantic import EmailStr
from sqlmodel import Session, or_, select
from starlette.status import HTTP_401_UNAUTHORIZED

from app.api.routes.v1.dto.message import MessageResponse
from app.core.config.env import get_env
from app.core.db.builders.permission import PermissionBuilder
from app.core.db.builders.role import RoleBuilder
from app.core.db.models import (
    LoginSession,
    User,
)
from app.core.db.setup import create_db_session
from app.core.security.checkers import (
    check_conditions,
    check_equality,
    check_existence,
    check_non_existence,
)
from app.core.security.permissions import (
    ACTION_CREATE,
    ACTION_READWRITE,
    ADMIN_ROLE_NAME,
    SUPER_ADMIN_ROLE_NAME,
    USER_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)
from app.utils.crypto import hash_password, verify_password
from app.utils.date import utc


async def register(
    db_session: Session,
    username: str,
    email: EmailStr,
    password: str,
    password_confirm: str,
    name: str,
):
    check_non_existence(
        (
            db_session.exec(
                select(User).where(
                    or_(User.email == email, User.username == username)
                )
            )
        ).first()
    )
    check_equality(password, password_confirm)
    hashed_password = hash_password(password=password)
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        name=name,
    )
    role = RoleBuilder().addUser(user).make()
    admin_role = (
        RoleBuilder().addUser(user).withName(ADMIN_ROLE_NAME).make()
        if email in get_env("ADMIN_EMAILS").split(",")
        else None
    )
    super_admin_role = (
        RoleBuilder().addUser(user).withName(SUPER_ADMIN_ROLE_NAME).make()
        if email in get_env("SUPER_ADMIN_EMAILS").split(",")
        else None
    )
    perm = (
        PermissionBuilder()
        .withActionName(ACTION_READWRITE)
        .withResourceName(USER_RESOURCE)
        .withResourceId(user.id)
        .forRole(role)
        .make()
    )

    db_session.add_all([user, perm, role])
    if admin_role is not None:
        db_session.add(admin_role)

    if super_admin_role is not None:
        db_session.add(super_admin_role)

    db_session.commit()
    return MessageResponse(message="Registered !")


async def login(
    db_session: Session,
    email: EmailStr,
    password: str,
    response: Response,
):
    user = check_existence(
        (db_session.exec(select(User).where(User.email == email))).first()
    )
    check_conditions([verify_password(password, user.hashed_password)])

    PermissionChecker(
        db_session=db_session,
        roles=user.roles,
        bypass_roles=[ADMIN_ROLE_NAME, SUPER_ADMIN_ROLE_NAME],
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_CREATE]
            )
        ],
    ).check(message="Email not authorized.")

    login_session = LoginSession(user_id=user.id)
    db_session.add(login_session)
    db_session.commit()
    response.set_cookie(
        key="user_session_id",
        value=login_session.id,
        httponly=True,
        expires=login_session.expires_at.astimezone(timezone.utc),
    )
    return MessageResponse(message="Logged in successfully.")


async def get_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    session_id: Annotated[str | None, Cookie(alias="user_session_id")] = None,
):
    login_session = check_existence(
        db_session.get(
            LoginSession,
            check_existence(session_id, detail="Not authenticated"),
        ),
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
    )
    check_conditions(
        [
            utc(login_session.expires_at) > datetime.now(timezone.utc),
            not login_session.expired,
        ],
        detail="Not authenticated.",
    )
    return login_session.user


async def ws_get_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    session_id: Annotated[str | None, Cookie(alias="user_session_id")] = None,
):
    login_session = check_existence(
        db_session.get(LoginSession, session_id),
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
    )
    check_conditions(
        [
            utc(login_session.expires_at) > datetime.now(timezone.utc),
            not login_session.expired,
        ],
        detail="Not authenticated.",
        is_ws=True,
    )
    return login_session.user


async def get_current_user_optional(
    db_session: Annotated[Session, Depends(create_db_session)],
    session_id: Annotated[str | None, Cookie(alias="user_session_id")] = None,
) -> User | None:
    """Get current user without throwing errors if not authenticated"""
    if session_id is None:
        return None

    try:
        return await get_current_user(
            db_session=db_session, session_id=session_id
        )
    except Exception:
        return None
