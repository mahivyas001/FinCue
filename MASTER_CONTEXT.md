# MASTER CONTEXT

## Future Architecture & Scalability

### Database Migration
Currently, the "AI Track Record Transparency" feature logs signal data and tracks signal outcomes in a local SQLite database (`backend/data/signal_log.db`).

- **Current Setup:** SQLite provides low-latency, self-contained persistence, running asynchronously using FastAPI `BackgroundTasks`. This keeps the API non-blocking and local-first.
- **Future Migration Path:** If the app is scaled and deployed across multiple server instances (e.g., containerized in cloud environments), local SQLite databases will lead to fragmented logging data. 
- **Recommendation:** Migrate the sqlite logging table (`signal_logs`) to a centralized relational database such as:
  - PostgreSQL (e.g., Supabase, RDS)
  - Configure connection pooling and update the DB session/connection manager in `backend/services/signal_log.py` to use SQLAlchemy or standard PostgreSQL drivers.
