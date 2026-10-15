import pytest
from app.ml.synthetic_data import generate_benchmark_dataset, FEATURE_COLUMNS
from app.ml.pipeline import train_support_model, evaluate_student_risk, get_loaded_model

def test_benchmark_dataset_generation():
    df = generate_benchmark_dataset(num_samples=100, random_seed=42)
    assert len(df) == 100
    for col in FEATURE_COLUMNS:
        assert col in df.columns
    assert "needs_support" in df.columns
    # Check that both classes exist
    assert 0 in df["needs_support"].values
    assert 1 in df["needs_support"].values

def test_pipeline_training_and_evaluation():
    results = train_support_model(save_artifact=False)
    assert results["success"] is True
    metrics = results["metrics"]
    assert metrics["accuracy"] > 0.85
    assert metrics["precision"] > 0.75
    assert metrics["recall"] > 0.75
    assert metrics["f1_score"] > 0.75
    assert metrics["roc_auc"] > 0.85
    assert len(results["feature_importances"]) == len(FEATURE_COLUMNS)

def test_prediction_high_risk_student():
    # Low attendance (52%), low coursework (40%), low exam marks (38%)
    student_data = {
        "student_id": "STU-RISK-001",
        "name": "At Risk Student",
        "attendance_percentage": 52.0,
        "assignment_completion_rate": 40.0,
        "average_exam_marks": 38.0,
        "failed_assignments_count": 3,
        "attendance_trend": -5.0
    }
    result = evaluate_student_risk(student_data)
    assert result["risk_level"] in ("High", "Medium")
    assert result["needs_support"] is True
    assert result["risk_score"] > 0.50
    assert len(result["primary_factors"]) > 0
    assert len(result["recommended_interventions"]) > 0

def test_prediction_low_risk_student():
    # High attendance (94%), high coursework (95%), high exam marks (88%)
    student_data = {
        "student_id": "STU-EXCELLENT-001",
        "name": "Honor Student",
        "attendance_percentage": 94.0,
        "assignment_completion_rate": 95.0,
        "average_exam_marks": 88.0,
        "failed_assignments_count": 0,
        "attendance_trend": 2.0
    }
    result = evaluate_student_risk(student_data)
    assert result["risk_level"] == "Low"
    assert result["needs_support"] is False
    assert result["risk_score"] < 0.35
