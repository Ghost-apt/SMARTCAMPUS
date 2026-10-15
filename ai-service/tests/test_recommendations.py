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
