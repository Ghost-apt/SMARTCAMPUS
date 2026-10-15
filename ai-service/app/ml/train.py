"""
SmartCampus AI — Standalone ML Training & Evaluation Script
===========================================================
Usage:
    cd "C:\VS CODE\SMARTCAMPUS\ai-service"
    .\venv\Scripts\python -m app.ml.train
"""

import sys
import os

# Safe UTF-8 console output for Windows PowerShell
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ml.pipeline import train_support_model

if __name__ == "__main__":
    print("==================================================")
    print("[TRAINING] SmartCampus Student Support Classifier...")
    print("==================================================")

    results = train_support_model(save_artifact=True)

    print("\n[OK] Model Training & Evaluation Complete!")
    print(f"Training Samples        : {results['samples_trained']}")
    print(f"Test Holdout Samples    : {results['test_samples']}")
    print(f"Accuracy                : {results['metrics']['accuracy'] * 100:.2f}%")
    print(f"Precision               : {results['metrics']['precision'] * 100:.2f}%")
    print(f"Recall                  : {results['metrics']['recall'] * 100:.2f}%")
    print(f"F1 Score                : {results['metrics']['f1_score'] * 100:.2f}%")
    print(f"ROC-AUC                 : {results['metrics']['roc_auc']:.4f}")
    print("\nFeature Importances:")
    for feat, imp in results["feature_importances"].items():
        print(f"  * {feat:28s}: {imp * 100:.1f}%")
    print(f"\nModel Artifact Persisted To : {results['saved_to']}")
    print("==================================================")
