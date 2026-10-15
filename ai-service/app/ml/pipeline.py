"""
SmartCampus AI — Machine Learning Early-Support Pipeline
========================================================
Architecture:
- Pipeline: StandardScaler + RandomForestClassifier (interpretable, non-overfitting ensemble)
- Metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix
- Explainability: Feature Importances & Factor Contribution Breakdown
- Responsible AI: Never takes automated punitive action; provides supportive human-in-the-loop alerts
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List

import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

from app.config import MODEL_PATH, MODEL_META_PATH
from app.ml.synthetic_data import generate_benchmark_dataset, FEATURE_COLUMNS

# Global in-memory cache for loaded model and metadata
_LOADED_MODEL = None
_LOADED_META = None

def build_pipeline(random_state: int = 42) -> Pipeline:
    """Constructs a clean, reproducible scikit-learn classification pipeline."""
    return Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=50,
            max_depth=5,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
            class_weight="balanced"
        ))
    ])

def train_support_model(df: Optional[pd.DataFrame] = None, save_artifact: bool = True) -> Dict[str, Any]:
    """
    Trains the Early-Support ML model on benchmark dataset, evaluates generalization
    on held-out test split, and persists the pipeline artifact.
    """
    global _LOADED_MODEL, _LOADED_META

    if df is None:
        df = generate_benchmark_dataset(num_samples=600, random_seed=42)

    X = df[FEATURE_COLUMNS]
    y = df["needs_support"]

    # 80/20 Stratified train-test split to evaluate on unseen holdout data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = build_pipeline(random_state=42)
    pipeline.fit(X_train, y_train)

    # Generalization evaluation on test set
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    conf_mat = confusion_matrix(y_test, y_pred).tolist()

    # Extract feature importances
    rf = pipeline.named_steps["classifier"]
    importances = dict(zip(FEATURE_COLUMNS, [round(float(x), 4) for x in rf.feature_importances_]))

    meta = {
        "model_name": "SmartCampus Student Support Classifier",
        "version": "1.0.0",
        "algorithm": "RandomForestClassifier(n_estimators=50, max_depth=5)",
        "features": FEATURE_COLUMNS,
        "is_trained": True,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": conf_mat
        },
        "feature_importances": importances,
        "trained_at": datetime.utcnow().isoformat(),
        "disclaimer": (
            "This model provides early academic-support indications for faculty review. "
            "It must not be used for automated grading, disciplinary sanctions, or high-stakes academic decisions."
        )
    }

    if save_artifact:
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(pipeline, MODEL_PATH)
        with open(MODEL_META_PATH, "w") as f:
            json.dump(meta, f, indent=2)

    _LOADED_MODEL = pipeline
    _LOADED_META = meta

    return {
        "success": True,
        "metrics": meta["metrics"],
        "feature_importances": importances,
        "samples_trained": len(X_train),
        "test_samples": len(X_test),
        "saved_to": MODEL_PATH
    }

def get_loaded_model() -> Tuple[Optional[Pipeline], Optional[Dict[str, Any]]]:
    """Loads model from disk or in-memory cache."""
    global _LOADED_MODEL, _LOADED_META

    if _LOADED_MODEL is not None and _LOADED_META is not None:
        return _LOADED_MODEL, _LOADED_META

    if os.path.exists(MODEL_PATH) and os.path.exists(MODEL_META_PATH):
        try:
            _LOADED_MODEL = joblib.load(MODEL_PATH)
            with open(MODEL_META_PATH, "r") as f:
                _LOADED_META = json.load(f)
            return _LOADED_MODEL, _LOADED_META
        except Exception as e:
            print(f"⚠️ Could not load saved model: {e}")

    return None, None

def evaluate_student_risk(metrics_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a student's academic standing using the trained ML model if available,
    falling back to transparent deterministic rules if uninitialized.
    """
    model, meta = get_loaded_model()

    att = float(metrics_dict.get("attendance_percentage", 85.0))
    ass = float(metrics_dict.get("assignment_completion_rate", 80.0))
    exam = float(metrics_dict.get("average_exam_marks", 75.0))
    failed = int(metrics_dict.get("failed_assignments_count", 0))
    trend = float(metrics_dict.get("attendance_trend", 0.0))

    primary_factors: List[str] = []
    interventions: List[str] = []

    # Identify transparent factors
    if att < 75.0:
        primary_factors.append(f"Lecture attendance ({att}%) is below the university 75% threshold.")
        interventions.append("Attend upcoming lecture sessions to restore examination eligibility.")
    if ass < 70.0:
        primary_factors.append(f"Coursework submission rate ({ass}%) indicates pending or delayed deliverables.")
        interventions.append("Submit pending lab exercises and assignments before portal deadlines.")
    if exam < 50.0:
        primary_factors.append(f"Internal assessment average ({exam}%) is below 50%.")
        interventions.append("Consult subject faculty during office hours for targeted conceptual revision.")
    if failed >= 2:
        primary_factors.append(f"Recorded {failed} missed or zero-score assignment submission(s).")
    if trend < -4.0:
        primary_factors.append(f"Attendance trajectory shows a recent decline ({trend}% over past 3 weeks).")

    if model is not None:
        # ML Model Inference with feature names to ensure compatibility
        feature_df = pd.DataFrame([[att, ass, exam, failed, trend]], columns=FEATURE_COLUMNS)
        risk_prob = float(model.predict_proba(feature_df)[0][1])
        risk_score = round(risk_prob, 3)
        confidence = round(float(abs(risk_prob - 0.5) * 2), 2)
        evaluation_basis = f"Trained ML Model ({meta.get('algorithm', 'RandomForest')})"
    else:
        # Rule-based Heuristic Fallback
        risk_points = 0.0
        if att < 75.0: risk_points += 0.40
        if att < 65.0: risk_points += 0.20
        if ass < 70.0: risk_points += 0.25
        if exam < 50.0: risk_points += 0.25
        if failed >= 2: risk_points += 0.15
        if trend < -3.0: risk_points += 0.10
        risk_score = round(min(1.0, risk_points), 3)
        confidence = 0.85
        evaluation_basis = "Rule-Based Transparent Heuristic (Threshold Audit)"

    if risk_score >= 0.60:
        risk_level = "High"
        needs_support = True
    elif risk_score >= 0.35:
        risk_level = "Medium"
        needs_support = True
    else:
        risk_level = "Low"
        needs_support = False

    if not primary_factors:
        primary_factors.append("Attendance compliance, coursework submission, and assessment scores are in good standing.")
    if not interventions:
        interventions.append("Continue current study routine and maintain positive attendance momentum.")

    return {
        "student_id": metrics_dict.get("student_id", "STU-001"),
        "name": metrics_dict.get("name", "Student"),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "needs_support": needs_support,
        "confidence": confidence,
        "primary_factors": primary_factors,
        "recommended_interventions": interventions,
        "evaluation_basis": evaluation_basis
    }
