from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from scheduler import start_scheduler

from routers import (
    auth,
    users,
    roles,
    permissions,
    countries,
    org_units,
    events,
    dashboard,
    event_attendance,
    registrations,
    abstracts,
    activity,
    email_logs,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = start_scheduler()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="CANECSA Events Space API Documentation",
    lifespan=lifespan,
    description="The CANECSA Events Space API is an API for CANECSA Events Management System.",
    version="0.0.1",
    terms_of_service="http://example.com/terms/",
    contact={
        "name": "Joel",
        "url": "https://github.com/jkumwenda",
        "email": "jkumwenda@gmail.com",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)

# ✅ Mount after FastAPI is initialized
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

origins = [
    "https://abstracts.canecsa.org",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, tags=["Auth"], prefix="/auth")
app.include_router(dashboard.router, tags=["Dashboard"], prefix="/dashboard")
app.include_router(users.router, tags=["Users"], prefix="/users")
app.include_router(roles.router, tags=["Roles"], prefix="/roles")
app.include_router(permissions.router, tags=["Permissions"], prefix="/permissions")
app.include_router(countries.router, tags=["Countries"], prefix="/countries")
app.include_router(org_units.router, tags=["Org units"], prefix="/org_units")
app.include_router(events.router, tags=["Events"], prefix="/events")
app.include_router(
    event_attendance.router, tags=["Event attendance"], prefix="/event_attendance"
)
app.include_router(
    registrations.router, tags=["Registrations"], prefix="/registrations"
)
app.include_router(abstracts.router, prefix="/abstracts", tags=["abstracts"])
app.include_router(activity.router, prefix="/activity", tags=["Activity"])
app.include_router(email_logs.router, prefix="/email-logs", tags=["Email Logs"])
