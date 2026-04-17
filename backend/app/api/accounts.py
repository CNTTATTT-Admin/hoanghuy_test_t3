"""Account Management API — Quản lý trạng thái tài khoản (ADMIN / ANALYST).

Endpoints:
- GET  /accounts/status/{user_id}     → Xem trạng thái tài khoản
- POST /accounts/freeze/{user_id}     → Đóng băng thủ công (ADMIN)
- POST /accounts/unfreeze/{user_id}   → Mở băng tài khoản (ADMIN)
- GET  /accounts/frozen               → Danh sách tất cả tài khoản frozen
- GET  /accounts/status-log/{user_id} → Lịch sử thay đổi trạng thái
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.security import require_role
from services.account_freeze_service import (
    freeze_account,
    get_account_status,
    get_account_status_log,
    list_frozen_accounts,
    unfreeze_account,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class FreezeRequest(BaseModel):
    reason: str = Field(..., min_length=3, description="Lý do đóng băng tài khoản")


class UnfreezeRequest(BaseModel):
    reason: str = Field(..., min_length=3, description="Lý do mở băng tài khoản")


@router.get("/accounts/status/{user_id}")
async def get_status(
    user_id: str,
    current_user: dict = Depends(require_role(["ADMIN", "ANALYST"])),
) -> Dict[str, Any]:
    """Xem trạng thái tài khoản."""
    status = await get_account_status(user_id)
    return {"user_id": user_id, "account_status": status}


@router.post("/accounts/freeze/{user_id}")
async def manual_freeze(
    user_id: str,
    body: FreezeRequest,
    current_user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """ADMIN đóng băng tài khoản thủ công."""
    success = await freeze_account(
        user_id=user_id,
        fraud_probability=1.0,
        reason=f"Manual freeze by ADMIN: {body.reason}",
        triggered_by="ADMIN_MANUAL",
    )
    if not success:
        raise HTTPException(status_code=400, detail="Account already frozen or user not found")
    return {
        "message": f"Account {user_id} has been frozen",
        "account_status": "frozen",
    }


@router.post("/accounts/unfreeze/{user_id}")
async def manual_unfreeze(
    user_id: str,
    body: UnfreezeRequest,
    current_user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """ADMIN mở băng tài khoản."""
    admin_uid = current_user.get("user_uid", "unknown")
    success = await unfreeze_account(
        user_id=user_id,
        admin_uid=admin_uid,
        reason=body.reason,
    )
    if not success:
        raise HTTPException(status_code=400, detail="Account is not frozen")
    return {
        "message": f"Account {user_id} has been unfrozen",
        "account_status": "active",
    }


@router.get("/accounts/frozen")
async def get_frozen_accounts(
    current_user: dict = Depends(require_role(["ADMIN", "ANALYST"])),
) -> Dict[str, Any]:
    """Danh sách tất cả tài khoản đang bị đóng băng."""
    accounts = await list_frozen_accounts()
    return {
        "frozen_accounts": accounts,
        "total": len(accounts),
    }


@router.get("/accounts/status-log/{user_id}")
async def get_status_log(
    user_id: str,
    current_user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """Lịch sử thay đổi trạng thái tài khoản."""
    history = await get_account_status_log(user_id)
    return {"user_id": user_id, "history": history}
