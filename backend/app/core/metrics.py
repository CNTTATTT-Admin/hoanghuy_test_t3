"""Custom Prometheus metrics cho FraudDetect.

Import và dùng các counters/histograms này ở bất kỳ đâu trong backend.
Tất cả metrics đều là module-level singletons — chỉ khai báo một lần.

Nhóm metrics:
  - Transaction counters: transactions_total, blocked_transactions_total
  - Latency histograms:   inference_latency_seconds, authorize_latency_seconds
  - Model scoring:        fraud_probability_histogram
  - Drift monitoring:     model_psi_score, model_ks_pvalue, model_fraud_rate_current, model_drift_severity
  - Infrastructure:       redis_cache_hits_total, redis_cache_misses_total,
                          kafka_messages_produced_total, kafka_consumer_lag
"""

from prometheus_client import Counter, Gauge, Histogram

# ── Transaction metrics ───────────────────────────────────────────────────────

# labels: tx_type = TRANSFER/CASH_OUT/..., risk_level = LOW/MEDIUM/HIGH, decision = ALLOW/BLOCK
transactions_total = Counter(
    "frauddetect_transactions_total",
    "Tổng số transaction được xử lý",
    ["tx_type", "risk_level", "decision"],
)

# label: block_reason = ML_MODEL | RULE_BASED | RATE_LIMIT | CACHE_HIT | VELOCITY_ABUSE
blocked_transactions_total = Counter(
    "frauddetect_blocked_transactions_total",
    "Số transaction bị block",
    ["block_reason"],
)

# ── Latency metrics ───────────────────────────────────────────────────────────

# Đo thời gian thuần ML inference (không bao gồm I/O)
inference_latency_seconds = Histogram(
    "frauddetect_inference_latency_seconds",
    "Latency của ML inference (giây)",
    buckets=[0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 1.0],
)

# Đo tổng thời gian xử lý /authorize endpoint (end-to-end)
authorize_latency_seconds = Histogram(
    "frauddetect_authorize_latency_seconds",
    "Tổng latency của /authorize endpoint (giây)",
    buckets=[0.01, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.5, 1.0],
)

# ── Model metrics ─────────────────────────────────────────────────────────────

# Histogram phân phối fraud probability — dùng cho Grafana Heatmap panel
fraud_probability_histogram = Histogram(
    "frauddetect_fraud_probability",
    "Phân phối fraud probability scores",
    buckets=[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
)

# PSI (Population Stability Index) mỗi feature — update bởi DriftDetector
model_psi_score = Gauge(
    "frauddetect_model_psi_score",
    "Population Stability Index mỗi feature",
    ["feature_name"],
)

# KS test p-value để phát hiện prediction score drift
model_ks_pvalue = Gauge(
    "frauddetect_model_ks_pvalue",
    "KS test p-value giữa current và reference prediction score distribution",
)

# Fraud rate trong cửa sổ 1h gần nhất — chỉ số concept drift
model_fraud_rate_current = Gauge(
    "frauddetect_fraud_rate_current_1h",
    "Fraud rate thực tế trong cửa sổ 1h gần nhất (concept drift indicator)",
)

# Drift severity tổng hợp: 0 = OK, 1 = MODERATE, 2 = SEVERE
model_drift_severity = Gauge(
    "frauddetect_drift_severity",
    "Mức độ drift tổng hợp: 0=OK, 1=MODERATE, 2=SEVERE",
)

# ── Infrastructure metrics ────────────────────────────────────────────────────

# Redis decision cache hits — tăng khi cache hit (tránh re-compute ML)
redis_cache_hits_total = Counter(
    "frauddetect_redis_cache_hits_total",
    "Số lần Redis decision cache hit",
)

# Redis decision cache misses — tăng khi phải chạy ML inference
redis_cache_misses_total = Counter(
    "frauddetect_redis_cache_misses_total",
    "Số lần Redis decision cache miss",
)

# Kafka produce counter — label: topic = transactions.audit | fraud.alerts
kafka_messages_produced_total = Counter(
    "frauddetect_kafka_messages_produced_total",
    "Số Kafka messages đã produce thành công",
    ["topic"],
)

# Kafka consumer lag — dùng để monitor consumer group chậm
kafka_consumer_lag = Gauge(
    "frauddetect_kafka_consumer_lag",
    "Kafka consumer group lag",
    ["topic", "partition"],
)
