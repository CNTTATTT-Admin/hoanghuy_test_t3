"""FastAPI Application Entry Point"""

import asyncio
import os
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# load_dotenv PHẢI chạy trước mọi local import vì email_service đọc SMTP_HOST khi import
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from prometheus_fastapi_instrumentator import Instrumentator

from api.transactions import router as transactions_router
from api.alerts import router as alerts_router
from api.analytics import router as analytics_router
from api.users import router as users_router
from api.auth import router as auth_router
from api.admin_users import router as admin_users_router
from api.settings import router as settings_router
from api.settings import _seed_defaults as seed_settings_defaults
from api.rules import router as rules_router
from api.rules import _seed_default_rules
from api.accounts import router as accounts_router
from core.redis_client import close_redis, get_redis, redis_health
from db.database import close_db, init_db, is_db_enabled
from logger import setup_logging
from notifier import get_notifier
from services.email_service import verify_smtp_connection

setup_logging()
logger = logging.getLogger(__name__)


async def _seed_default_admin():
    """Tạo tài khoản admin mặc định nếu bảng users rỗng.

    Chỉ chạy một lần khi khởi tạo hệ thống lần đầu.
    Password mặc định CẦN THAY ĐỔI NGAY sau deploy.
    """
    try:
        from db.user_repository import count_users, create_user, add_audit_log
        from core.security import hash_password

        total = await count_users()
        if total > 0:
            logger.info("Bảng users đã có %d tài khoản — bỏ qua seed admin.", total)
            return

        admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@frauddetect.com")
        admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@123456")

        admin = await create_user(
            email=admin_email,
            password_hash=hash_password(admin_password),
            full_name="System Administrator",
            role="ADMIN",
            is_active=True,
            is_email_verified=True,
        )

        if admin:
            await add_audit_log(
                target_user_uid=admin["user_uid"],
                action="ACCOUNT_CREATED",
                new_value="ADMIN",
                changed_by_uid=None,
            )
            logger.info("✅ Tài khoản admin mặc định đã được tạo: %s", admin_email)
        else:
            logger.warning("Không thể tạo tài khoản admin mặc định.")
    except Exception as exc:
        logger.warning("Lỗi khi seed admin (non-critical): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Fraud Detection API")
    notifier = get_notifier()
    await notifier.initialize()
    db_ready = await init_db()
    if db_ready:
        logger.info("PostgreSQL integration enabled.")
        # Seed tài khoản admin mặc định nếu bảng users rỗng
        await _seed_default_admin()
        # Seed giá trị mặc định cho settings
        await seed_settings_defaults()
        await _seed_default_rules()
    else:
        logger.warning("PostgreSQL integration disabled. Running without persistence.")

    # Kiểm tra kết nối SMTP khi khởi động (non-critical — không dừng server nếu lỗi)
    await verify_smtp_connection()

    # ── Redis startup check ───────────────────────────────────────────────
    _redis = await get_redis()
    if _redis is not None:
        logger.info(
            "✅ Redis connected — REDIS_URL=%s  |  Rate-limit: Redis-backed  |  Behavioral state: persistent",
            os.getenv("REDIS_URL", "(default)"),
        )
    else:
        logger.warning(
            "⚠️  Redis NOT available — ENABLE_REDIS=%s  REDIS_URL=%s  |  "
            "Rate-limit: in-memory only  |  Behavioral state: will reset on restart",
            os.getenv("ENABLE_REDIS", "(not set)"),
            os.getenv("REDIS_URL", "(not set)"),
        )

    # Khởi động Kafka producer/consumer nếu ENABLE_KAFKA=true
    _kafka_producer = None
    _kafka_consumer = None
    if os.getenv("ENABLE_KAFKA", "false").lower() == "true":
        from kafka.producer import KafkaProducer, _set_producer  # pylint: disable=import-outside-toplevel
        from kafka.consumer import KafkaConsumer                  # pylint: disable=import-outside-toplevel
        _kafka_producer = KafkaProducer()
        _kafka_consumer = KafkaConsumer()
        started = await _kafka_producer.start()
        if started:
            _set_producer(_kafka_producer)  # đăng ký singleton toàn cục
            await _kafka_consumer.start()   # start() tự tạo background tasks
            logger.info("Kafka pipeline khởi động thành công")
        else:
            logger.warning("Kafka pipeline bị bỏ qua (broker không available)")

    # Khởi động drift monitoring scheduler nếu ENABLE_DRIFT_MONITORING=true
    _scheduler = None
    if os.getenv("ENABLE_DRIFT_MONITORING", "true").lower() == "true":
        try:
            import sys as _sys, pathlib as _pathlib  # pylint: disable=import-outside-toplevel
            # Thêm project root vào sys.path để import ml.monitoring
            _project_root = str(_pathlib.Path(__file__).resolve().parents[3])
            if _project_root not in _sys.path:
                _sys.path.insert(0, _project_root)

            from apscheduler.schedulers.asyncio import AsyncIOScheduler      # pylint: disable=import-outside-toplevel
            from ml.monitoring.reference_stats import ReferenceStatsCollector  # pylint: disable=import-outside-toplevel
            from ml.monitoring.drift_detector import DriftDetector             # pylint: disable=import-outside-toplevel

            _ref_stats = ReferenceStatsCollector.load_latest()
            if _ref_stats is not None:
                _db_pool = None
                if is_db_enabled():
                    from db.database import get_pool as _get_pool  # pylint: disable=import-outside-toplevel
                    _db_pool = _get_pool()

                _drift_detector = DriftDetector(
                    model_version=_ref_stats.get("model_version", "latest"),
                    reference_stats=_ref_stats,
                    db_pool=_db_pool,
                )

                _drift_interval_hours = int(os.getenv("DRIFT_CHECK_INTERVAL_HOURS", "1"))
                _scheduler = AsyncIOScheduler()
                _scheduler.add_job(
                    _drift_detector.run_drift_check,
                    trigger="interval",
                    hours=_drift_interval_hours,
                    id="drift_check",
                    replace_existing=True,
                )
                _scheduler.start()
                logger.info(
                    "Drift monitoring scheduler khởi động (interval=%dh)", _drift_interval_hours
                )
            else:
                logger.warning(
                    "Reference stats không tìm thấy — drift monitoring bị bỏ qua. "
                    "Chạy python -m ml.modeling.train để tạo reference stats."
                )
        except ImportError as _imp_err:
            logger.warning("Drift monitoring không khởi động được (thiếu dependency): %s", _imp_err)
        except Exception as _sched_err:
            logger.warning("Drift monitoring scheduler lỗi (non-critical): %s", _sched_err)

    # Print startup message
    print("\n" + "="*60)
    print("🎉 Fraud Detection API started successfully!")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("🔍 Root Endpoint: http://localhost:8000/")
    print("="*60 + "\n")

    yield

    # Shutdown
    logger.info("Shutting down Fraud Detection API")
    # Dừng drift monitoring scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        logger.info("Drift monitoring scheduler đã dừng")
    # Dừng Kafka trước khi đóng DB (consumer có thể đang persist)
    if _kafka_consumer is not None:
        await _kafka_consumer.stop()
    if _kafka_producer is not None:
        await _kafka_producer.stop()
    await close_db()
    await close_redis()  # Đóng Redis connection pool
    await notifier.cleanup()

# Create FastAPI app
app = FastAPI(
    title="Fraud Detection API",
    description="API để phát hiện gian lận giao dịch tài chính sử dụng Machine Learning",
    version="1.0.0",
    lifespan=lifespan
) 

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) # Middleware cho phép CORS, cần cấu hình lại allow_origins cho môi trường production để tăng cường bảo mật

# Mount Prometheus Instrumentator — expose /metrics endpoint cho Prometheus scrape
# include_in_schema=False để ẩn khỏi /docs; should_ignore_untemplated bỏ qua 404 requests
Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
    should_instrument_requests_inprogress=True,
    inprogress_name="frauddetect_http_requests_inprogress",
    inprogress_labels=True,
).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# Include routers # Đăng ký các router cho transactions, alerts, users với prefix /api/v1 và tags tương ứng
app.include_router(
    transactions_router,
    prefix="/api/v1",
    tags=["transactions"]
) # Router xử lý các endpoint liên quan đến giao dịch

app.include_router(
    alerts_router,
    prefix="/api/v1",
    tags=["alerts"]
) # Router xử lý các endpoint liên quan đến cảnh báo gian lận

app.include_router(
    analytics_router,
    prefix="/api/v1",
    tags=["analytics"]
) # Router tổng hợp dữ liệu analytics cho trang phân tích

app.include_router(
    users_router,
    prefix="/api/v1",
    tags=["users"]
) # Router xử lý các endpoint liên quan đến người dùng (đăng nhập, quản lý tài khoản)

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["auth"]
) # Router xác thực: đăng ký, đăng nhập, đăng xuất, xác thực email

app.include_router(
    admin_users_router,
    prefix="/api/v1",
    tags=["admin"]
) # Router quản lý tài khoản hệ thống — chỉ ADMIN

app.include_router(settings_router) # Router cài đặt hệ thống — ADMIN only
app.include_router(rules_router)    # Router quản lý Rule Engine — ADMIN only

app.include_router(
    accounts_router,
    prefix="/api/v1",
    tags=["accounts"],
) # Router quản lý trạng thái tài khoản — freeze/unfreeze

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Fraud Detection API",
        "version": "1.0.0",
        "status": "running"
    } # Endpoint gốc trả về thông tin cơ bản về API, có thể dùng để kiểm tra nhanh nếu API đang chạy hay không

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "db_enabled": is_db_enabled(),
        "redis_healthy": await redis_health(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    } # Endpoint kiểm tra sức khỏe của API, trả về trạng thái, thông tin về việc tích hợp cơ sở dữ liệu và timestamp hiện tại

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    ) # Xử lý ngoại lệ toàn cục, ghi log lỗi và trả về phản hồi lỗi chuẩn cho client

if __name__ == "__main__": # Chạy ứng dụng bằng Uvicorn khi thực thi trực tiếp
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Fraud Detection API is starting...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("="*50 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 