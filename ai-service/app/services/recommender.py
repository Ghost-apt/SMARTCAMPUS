"""
SmartCampus AI — Personalized Learning Recommender Engine
=========================================================
Maps student performance gaps (identified via marks, attendance, or weak subjects)
to approved curriculum syllabus topics and available digital library resources.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime

# Standard BCA Curriculum Topic Mapping
SYLLABUS_TOPICS: Dict[str, Dict[str, Any]] = {
    "BCA-501": {
        "name": "Artificial Intelligence & Machine Learning",
        "topics": [
            {
                "topic": "Convolutional Neural Networks (CNNs) & Computer Vision",
                "focus": "Core architecture, convolutional filters, max-pooling, and transfer learning.",
                "keywords": ["cnn", "neural", "vision", "image", "pytorch", "deep learning"]
            },
            {
                "topic": "Model Evaluation & Generalization Metrics",
                "focus": "Precision, recall, F1-score, ROC-AUC, and cross-validation strategies.",
                "keywords": ["metrics", "evaluation", "f1", "roc", "accuracy", "model"]
            },
            {
                "topic": "Supervised Machine Learning Algorithms",
                "focus": "Decision trees, random forests, support vector machines, and regularization.",
                "keywords": ["supervised", "classification", "regression", "tree", "forest"]
            }
        ]
    },
    "BCA-502": {
        "name": "Full-Stack Web Engineering",
        "topics": [
            {
                "topic": "RESTful API Design & Stateless JWT Authentication",
                "focus": "Secure token generation, HttpOnly cookies, and role authorization middleware.",
                "keywords": ["jwt", "auth", "api", "rest", "security", "express"]
            },
            {
                "topic": "Database Optimization & Compound Indexing in MongoDB",
                "focus": "Query execution plans, aggregation pipelines, and schema denormalization.",
                "keywords": ["mongodb", "database", "index", "aggregation", "query", "nosql"]
            },
            {
                "topic": "React Component Architecture & State Management",
                "focus": "Hooks lifecycle, context API, memoization, and client-side routing.",
                "keywords": ["react", "component", "state", "hooks", "frontend"]
            }
        ]
    },
    "BCA-503": {
        "name": "Database Management Systems",
        "topics": [
            {
                "topic": "Relational Normalization (3NF & Boyce-Codd Normal Form)",
                "focus": "Functional dependencies, lossless join decomposition, and redundancy reduction.",
                "keywords": ["normalization", "3nf", "bcnf", "relational", "dependencies"]
            },
            {
                "topic": "Transaction Concurrency Control & ACID Guarantees",
                "focus": "Two-phase locking, timestamp ordering, deadlock detection, and serializability.",
                "keywords": ["transaction", "acid", "concurrency", "lock", "deadlock"]
            },
            {
                "topic": "SQL Query Optimization & B-Tree Indexing",
                "focus": "Clustered vs non-clustered indexes, join algorithms, and execution statistics.",
                "keywords": ["sql", "index", "query", "optimization", "b-tree"]
            }
        ]
    },
    "BCA-504": {
        "name": "Cloud Computing & DevOps",
        "topics": [
            {
                "topic": "Containerization with Docker & Multi-Stage Builds",
                "focus": "Dockerfiles, container networking, volume persistence, and image optimization.",
                "keywords": ["docker", "container", "devops", "cloud", "deployment"]
            },
            {
                "topic": "Continuous Integration & Automated Testing Pipelines",
                "focus": "Automated test runners, GitHub actions, linting, and staged deployments.",
                "keywords": ["ci/cd", "pipeline", "testing", "actions", "automation"]
            }
        ]
    }
}

def generate_learning_recommendations(
    student_id: str,
    weak_subjects: Optional[List[str]] = None,
    attendance_percentage: float = 85.0,
    average_marks: float = 75.0,
    available_resources: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Synthesizes actionable, explainable study recommendations tailored to the
    student's current academic performance gaps.
    """
    recommendations: List[Dict[str, Any]] = []
    available_resources = available_resources or []
    weak_subjects = weak_subjects or []

    # If no explicit weak subjects provided, identify default priority subjects
    if not weak_subjects:
        if average_marks < 60.0 or attendance_percentage < 75.0:
            weak_subjects = ["BCA-501", "BCA-503"]
        else:
            weak_subjects = ["BCA-501"]

    for sub_code in weak_subjects:
        normalized_code = sub_code.upper().strip()
        syllabus = SYLLABUS_TOPICS.get(normalized_code)

        if not syllabus:
            # Fallback for unrecognized course code
            recommendations.append({
                "subject_code": normalized_code,
                "subject_name": f"Module {normalized_code}",
                "recommended_topic": "Course Syllabus Core Review",
                "reason": f"Recorded performance in {normalized_code} would benefit from scheduled review.",
                "priority": "Medium",
                "resource_title": "Course Reference Material",
                "resource_url": "https://smartcampus.edu/resources/syllabus.pdf",
                "action_type": "Review Resource"
            })
            continue

        sub_name = syllabus["name"]
        topics = syllabus["topics"]

        # Pick top 1 or 2 high-impact topics for this subject
        for i, topic_meta in enumerate(topics[:2]):
            topic_title = topic_meta["topic"]
            topic_keywords = topic_meta["keywords"]

            # Search available database resources for keyword matching
            matched_resource = None
            for r in available_resources:
                r_title = r.get("title", "").lower()
                r_code = r.get("subject_code", "").upper()
                if (r_code == normalized_code or any(kw in r_title for kw in topic_keywords)):
                    matched_resource = r
                    break

            # Set explainable urgency
            if attendance_percentage < 75.0:
                priority = "High"
                reason = f"Attendance in {normalized_code} is below 75%. Reviewing this foundational module helps catch up on missed sessions."
            elif average_marks < 65.0:
                priority = "High"
                reason = f"Internal assessment scores indicate key conceptual gaps in {topic_title.split('&')[0].strip()}."
            else:
                priority = "Medium" if i == 0 else "Standard"
                reason = f"Advance preparation recommended for upcoming semester practical evaluations."

            recommendations.append({
                "subject_code": normalized_code,
                "subject_name": sub_name,
                "recommended_topic": topic_title,
                "reason": reason,
                "priority": priority,
                "resource_title": matched_resource.get("title") if matched_resource else f"{sub_name} — Comprehensive Notes",
                "resource_url": matched_resource.get("file_url") if matched_resource else "https://smartcampus.edu/resources/sample-handout.pdf",
                "action_type": "Review Resource" if matched_resource else "Practice Problems"
            })

    # Sort so High priority recommendations appear first
    priority_order = {"High": 0, "Medium": 1, "Standard": 2}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))

    return recommendations
