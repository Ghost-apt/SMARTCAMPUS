"""
SmartCampus AI — Synthetic Academic Benchmark Dataset Generator
================================================================
CRITICAL NOTE:
This module generates an isolated, reproducible synthetic benchmark dataset
explicitly designated for training, testing, and validating the scikit-learn
Early-Support Machine Learning pipeline.

In compliance with institutional ethics, privacy regulations, and Section 10 of
the project specification, this synthetic data is NEVER mixed with real student records.
"""

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "attendance_percentage",
    "assignment_completion_rate",
    "average_exam_marks",
    "failed_assignments_count",
    "attendance_trend"
]

def generate_benchmark_dataset(num_samples: int = 600, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic academic student performance profiles with known ground-truth
    labels for training and verifying the machine learning early-support model.
    """
    np.random.seed(random_seed)

    # 1. Generate core academic features with realistic multimodal student distributions
    # Attendance: mean 82%, std 14%
    attendance = np.clip(np.random.normal(loc=82.0, scale=13.5, size=num_samples), 35.0, 100.0)

    # Assignment completion: correlates moderately with attendance
    assignment_noise = np.random.normal(loc=0.0, scale=8.0, size=num_samples)
    assignment_completion = np.clip(0.85 * attendance + assignment_noise + 10.0, 20.0, 100.0)

    # Average Exam Marks: mean 72%, std 15%
    exam_noise = np.random.normal(loc=0.0, scale=10.0, size=num_samples)
    exam_marks = np.clip(0.70 * attendance + 0.20 * assignment_completion + exam_noise, 25.0, 98.0)

    # Failed assignments: Poisson distributed (higher when completion is low)
    failed_lambda = np.clip(4.0 - (assignment_completion / 25.0), 0.1, 5.0)
    failed_assignments = np.random.poisson(lam=failed_lambda, size=num_samples)

    # Attendance trend (percentage point shift over last 3 weeks): [-15% to +15%]
    trend = np.clip(np.random.normal(loc=0.5, scale=4.5, size=num_samples), -15.0, 15.0)

    # 2. Determine Ground-Truth Target Label: 'needs_support' (0 = Low Risk, 1 = Support Recommended)
    # Based on transparent university criteria:
    # - Debarred attendance (< 75%) accompanied by struggling assignment submission (< 70%)
    # - Critical examination failure (< 45%)
    # - Severely low attendance (< 65%) regardless of marks
    # - High missed assignment count (>= 3)
    base_risk = (
        ((attendance < 75.0) & (assignment_completion < 70.0)) |
        (exam_marks < 45.0) |
        (attendance < 62.0) |
        (failed_assignments >= 3)
    )

    # Add realistic 4% stochastic label noise to test ML generalization
    noise_mask = np.random.random(size=num_samples) < 0.04
    needs_support = np.where(noise_mask, 1 - base_risk.astype(int), base_risk.astype(int))

    df = pd.DataFrame({
        "attendance_percentage": np.round(attendance, 1),
        "assignment_completion_rate": np.round(assignment_completion, 1),
        "average_exam_marks": np.round(exam_marks, 1),
        "failed_assignments_count": failed_assignments,
        "attendance_trend": np.round(trend, 1),
        "needs_support": needs_support
    })

    return df
