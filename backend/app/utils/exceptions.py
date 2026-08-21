from typing import Any

from fastapi import HTTPException, status


class VibeGramException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Any | None = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": details},
        )
        self.code = code
        self.message = message
        self.details = details


class NotFoundException(VibeGramException):
    def __init__(self, resource: str, identifier: str = ""):
        message = f"{resource} not found" if not identifier else f"{resource} '{identifier}' not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=message,
        )


class ConflictException(VibeGramException):
    def __init__(self, message: str, details: Any | None = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
            details=details,
        )


class UnauthorizedException(VibeGramException):
    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
        )


class ForbiddenException(VibeGramException):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
        )


class BadRequestException(VibeGramException):
    def __init__(self, message: str, details: Any | None = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            message=message,
            details=details,
        )
