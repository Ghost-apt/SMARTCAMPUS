import pytest
from app.services.recommender import generate_learning_recommendations
from app.services.assistant import classify_intent, generate_campus_response

def test_recommendations_generation_for_weak_subject():
    recs = generate_learning_recommendations(
        student_id="STU-001",
        weak_subjects=["BCA-503"],
        attendance_percentage=68.0,
        average_marks=55.0,
        available_resources=[
            {
                "title": "Database Normalization and BCNF Notes",
                "subject_code": "BCA-503",
                "file_url": "https://smartcampus.edu/resources/dbms-notes.pdf"
            }
        ]
    )
    assert len(recs) >= 1
    assert any(r["subject_code"] == "BCA-503" for r in recs)
    assert recs[0]["priority"] == "High"
    assert "attendance" in recs[0]["reason"].lower() or "assessment" in recs[0]["reason"].lower()

def test_assistant_intent_classification():
    assert classify_intent("What assignments are due tomorrow?") == "UPCOMING_ASSIGNMENTS"
    assert classify_intent("What classes do I have today?") == "TODAYS_CLASSES"
    assert classify_intent("What is my current attendance?") == "ATTENDANCE_STATUS"
    assert classify_intent("Show my semester exam marks and CGPA") == "EXAM_RESULTS"
    assert classify_intent("Tell me about university leave rules") == "GENERAL_POLICY"

def test_assistant_response_with_authorized_context():
    context = {
        "attendance_percentage": 91.5,
        "assignments": [
            {"title": "PyTorch CNN Lab", "subject_code": "BCA-501", "due_date": "Tomorrow"}
        ],
        "todays_classes": [
            {"subject_name": "Artificial Intelligence", "time_slot": "09:30 AM", "room": "Lab 301"}
        ]
    }
    
    # Test assignments response
    ass_res = generate_campus_response("STU-001", "student", "What assignments do I have?", context)
    assert "PyTorch CNN Lab" in ass_res["response"]
    assert ass_res["source"] == "authorized-campus-records"

    # Test timetable response
    tt_res = generate_campus_response("STU-001", "student", "What classes do I have today?", context)
    assert "Artificial Intelligence" in tt_res["response"]
    assert "Lab 301" in tt_res["response"]

    # Test attendance response
    att_res = generate_campus_response("STU-001", "student", "What is my attendance rate?", context)
    assert "91.5%" in att_res["response"]

def test_internal_auth_missing_key_rejected():
    from fastapi import HTTPException
    from app.api.routes import verify_internal_auth

    with pytest.raises(HTTPException) as exc_info:
        verify_internal_auth(None)
    assert exc_info.value.status_code == 401
    assert "Missing or empty" in exc_info.value.detail

def test_internal_auth_empty_key_rejected():
    from fastapi import HTTPException
    from app.api.routes import verify_internal_auth

    with pytest.raises(HTTPException) as exc_info:
        verify_internal_auth("   ")
    assert exc_info.value.status_code == 401

def test_internal_auth_invalid_key_rejected():
    from fastapi import HTTPException
    from app.api.routes import verify_internal_auth

    with pytest.raises(HTTPException) as exc_info:
        verify_internal_auth("attacker-spoofed-key-2026")
    assert exc_info.value.status_code == 403
    assert "Unauthorized" in exc_info.value.detail

def test_internal_auth_valid_key_accepted():
    from app.api.routes import verify_internal_auth
    from app.config import INTERNAL_API_KEY

    assert verify_internal_auth(INTERNAL_API_KEY) is True

def test_all_protected_endpoints_enforce_auth_dependency():
    from app.api.routes import router, verify_internal_auth

    protected_paths = {
        "/predict/academic-support",
        "/predict/batch",
        "/recommendations",
        "/assistant/respond",
        "/ml/train",
        "/ml/model-info",
        "/rag/ingest",
        "/rag/query",
        "/rag/status",
        "/rag/document/{document_id}"
    }

    found_paths = set()
    for route in router.routes:
        if hasattr(route, "path") and route.path in protected_paths:
            found_paths.add(route.path)
            # Route must declare verify_internal_auth in its dependencies
            dep_callables = [d.dependency for d in getattr(route, "dependencies", [])]
            assert verify_internal_auth in dep_callables, f"Route {route.path} is missing verify_internal_auth dependency!"

    assert protected_paths == found_paths, f"Expected to find all protected routes, found {found_paths}"

def test_health_endpoint_is_public():
    from app.api.routes import router, verify_internal_auth

    health_routes = [r for r in router.routes if getattr(r, "path", None) == "/health"]
    assert len(health_routes) == 1
    dep_callables = [d.dependency for d in getattr(health_routes[0], "dependencies", [])]
    assert verify_internal_auth not in dep_callables, "Public /health endpoint must not require internal auth."


