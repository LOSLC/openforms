import uuid
from datetime import datetime, timedelta, timezone
from typing import List

from sqlmodel import Column, DateTime, Field, Relationship, SQLModel

from app.api.routes.v1.dto.form import (
    AnswerSessionDTO,
    FieldResponseDTO,
    FormDTO,
    FormFieldDTO,
)
from app.utils.crypto import gen_id, gen_otp


class RoleUserLink(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    role_id: str = Field(foreign_key="role.id", primary_key=True)


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(10), primary_key=True)
    email: str
    username: str
    hashed_password: str
    name: str
    registered_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    verified: bool = False
    login_sessions: list["LoginSession"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    auth_sessions: list["AuthSession"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    roles: List["Role"] = Relationship(
        back_populates="users",
        link_model=RoleUserLink,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    forms: List["Form"] = Relationship(
        back_populates="author",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    verification_sessions: List["AccountVerificationSession"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class Role(SQLModel, table=True):
    id: str = Field(default_factory=gen_id, primary_key=True)
    name: str | None = None
    permissions: list["Permission"] = Relationship(back_populates="role")
    users: List[User] = Relationship(
        back_populates="roles",
        link_model=RoleUserLink,
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class Permission(SQLModel, table=True):
    permission_id: str = Field(default_factory=gen_id, primary_key=True)
    name: str = Field(primary_key=True)
    role_id: str | None = Field(foreign_key="role.id", default=None)
    role: Role = Relationship(
        back_populates="permissions",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class Form(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    label: str
    description: str | None = None
    open: bool = False
    submissions_limit: int | None = None
    submissions: int = 0
    deadline: datetime | None = None
    fields: List["FormField"] = Relationship(
        back_populates="form",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    answer_sessions: List["AnswerSession"] = Relationship(
        back_populates="form",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    author: User = Relationship(
        back_populates="forms",
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    def to_dto(self):
        return FormDTO(
            id=self.id,
            label=self.label,
            description=self.description,
            fields_length=len(self.fields),
            open=self.open,
            submissions_limit=self.submissions_limit,
            deadline=self.deadline,
            submissions=self.submissions,
        )


class FormField(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    form_id: uuid.UUID = Field(foreign_key="form.id")
    label: str
    description: str
    position: int | None = None
    required: bool = True
    field_type: str  # Boolean, Numerical, Text, Multiselect, Select
    possible_answers: (
        str | None  # Strings separeted by commas only applies for Multiselect
    ) = None
    number_bounds: str | None = (
        None  # min:max, only used with Numerical fields
    )
    text_bounds: str | None = None  # min:max, only used with
    answers: List["FieldAnswer"] = Relationship(
        back_populates="field",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    form: Form = Relationship(
        back_populates="fields",
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    def to_dto(self):
        return FormFieldDTO(
            id=self.id,
            form_id=self.form_id,
            label=self.label,
            description=self.description,
            position=self.position,
            required=self.required,
            field_type=self.field_type,
            possible_answers=self.possible_answers,
            number_bounds=self.number_bounds,
            text_bounds=self.text_bounds,
        )


class FieldAnswer(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    field_id: uuid.UUID = Field(foreign_key="formfield.id")
    session_id: uuid.UUID = Field(foreign_key="answersession.id")
    value: str | None = None
    field: FormField = Relationship(
        back_populates="answers",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    session: "AnswerSession" = Relationship(
        back_populates="answers",
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    def to_dto(self):
        return FieldResponseDTO(
            id=self.id,
            field_id=self.field_id,
            value=self.value,
            session_id=self.session_id,
            field=self.field.to_dto(),
        )


class AnswerSession(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    form_id: uuid.UUID = Field(foreign_key="form.id")
    answers: List[FieldAnswer] = Relationship(
        back_populates="session",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    submitted: bool = False
    form: Form = Relationship(
        back_populates="answer_sessions",
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    def to_dto(self):
        return AnswerSessionDTO(
            id=self.id,
            form_id=self.form_id,
            submitted=self.submitted,
            answers=[answer.to_dto() for answer in self.answers],
        )
    submitted_at: datetime | None = None


class LoginSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(30), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
        + timedelta(days=60),
        sa_column=Column(DateTime(timezone=True)),
    )
    expired: bool = False
    user: User = Relationship(
        back_populates="login_sessions",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class AuthSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(50), primary_key=True)
    token: str = Field(default_factory=lambda: gen_otp(6))
    tries: int = 0
    max_tries: int = 3
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
        + timedelta(minutes=60),
        sa_column=Column(DateTime(timezone=True)),
    )
    expired: bool = False
    verified: bool = False
    user: User = Relationship(
        back_populates="auth_sessions",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class AccountVerificationSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: gen_id(60), primary_key=True)
    token: str = Field(default_factory=lambda: gen_id(8))
    user_id: str = Field(foreign_key="user.id")
    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=1)
    )
    tries: int = 0
    max_tries: int = 3
    expired: bool = False
    user: User = Relationship(back_populates="verification_sessions")
