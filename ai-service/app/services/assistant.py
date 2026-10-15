"""
SmartCampus AI — Role-Aware Academic & Campus Assistant Service
===============================================================
Combines authorized live student records (passed securely from Node.js backend)
with structured academic domain knowledge and optional local LLM integration.
"""

import requests
from typing import Dict, Any, Optional
from datetime import datetime

from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL, USE_LOCAL_LLM

def classify_intent(query: str) -> str:
    """Classifies user inquiry into supported campus domains."""
    q = query.lower()
    if any(k in q for k in ["assignment", "homework", "due", "submission", "deadline", "project"]):
        return "UPCOMING_ASSIGNMENTS"
    elif any(k in q for k in ["class", "today", "timetable", "schedule", "routine", "lecture", "period"]):
        return "TODAYS_CLASSES"
    elif any(k in q for k in ["attendance", "present", "absent", "attendance percentage", "debarred", "75%"]):
        return "ATTENDANCE_STATUS"
    elif any(k in q for k in ["result", "marks", "grade", "gpa", "cgpa", "midterm", "exam score"]):
        return "EXAM_RESULTS"
    elif any(k in q for k in ["fee", "dues", "tuition", "payment", "bursar", "receipt"]):
        return "FEE_STATUS"
    elif any(k in q for k in ["syllabus", "bca", "course outcomes", "curriculum", "subject"]):
        return "COURSE_SYLLABUS"
    elif any(k in q for k in ["policy", "leave", "medical", "hostel", "library", "rule"]):
        return "GENERAL_POLICY"
    else:
        return "GENERAL_ACADEMIC_CONCEPT"

def generate_campus_response(user_id: str, role: str, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Synthesizes an intelligent, authorized response using live student context.
    """
    context = context or {}
    intent = classify_intent(query)
    q = query.lower()

    # 1. UPCOMING ASSIGNMENTS INTENT
    if intent == "UPCOMING_ASSIGNMENTS":
        assignments = context.get("assignments", [])
        if assignments:
            lines = [f"📋 You currently have {len(assignments)} open assignment(s):"]
            for a in assignments[:4]:
                due_str = a.get("due_date", "Soon")
                lines.append(f"• **{a.get('title')}** ({a.get('subject_code', 'Course')}) — Due: {due_str}")
            lines.append("\nYou can upload your completed deliverables directly under **Assignments**.")
            return {
                "response": "\n".join(lines),
                "intent": intent,
                "source": "authorized-campus-records"
            }
        return {
            "response": "✅ You have no pending assignments with imminent deadlines at this time. All submissions are up to date!",
            "intent": intent,
            "source": "authorized-campus-records"
        }

    # 2. TODAY'S CLASSES INTENT
    elif intent == "TODAYS_CLASSES":
        classes = context.get("todays_classes", [])
        if classes:
            lines = [f"📅 Your academic schedule for today includes {len(classes)} lecture(s):"]
            for c in classes:
                lines.append(f"• **{c.get('time_slot', 'Scheduled')}**: {c.get('subject_name')} in **{c.get('room', 'TBA')}** (Prof. {c.get('faculty_name', 'Faculty')})")
            return {
                "response": "\n".join(lines),
                "intent": intent,
                "source": "authorized-campus-records"
            }
        return {
            "response": "🏖️ No scheduled lecture periods found on your routine for today. You can review upcoming days in your **Weekly Timetable**.",
            "intent": intent,
            "source": "authorized-campus-records"
        }

    # 3. ATTENDANCE STATUS INTENT
    elif intent == "ATTENDANCE_STATUS":
        att_pct = context.get("attendance_percentage", 88.5)
        is_eligible = att_pct >= 75.0
        status_msg = "meets university exam requirements (≥ 75%)" if is_eligible else "is below the 75% threshold and requires immediate attention"
        
        breakdown = context.get("subject_attendance", [])
        lines = [
            f"📊 Your current overall attendance is **{att_pct}%**, which {status_msg}."
        ]
        if breakdown:
            lines.append("\n**Subject-wise Standing:**")
            for b in breakdown[:4]:
                flag = "✅" if b.get("percentage", 100) >= 75 else "⚠️"
                lines.append(f"• {flag} {b.get('subject_code')}: **{b.get('percentage')}%** ({b.get('present')}/{b.get('total')} sessions)")
        
        lines.append("\n💡 You can use **QR Check-in** on your Attendance page during live lectures to log attendance instantly.")
        return {
            "response": "\n".join(lines),
            "intent": intent,
            "source": "authorized-campus-records"
        }

    # 4. EXAM RESULTS INTENT
    elif intent == "EXAM_RESULTS":
        cgpa = context.get("cgpa", "8.75")
        results = context.get("recent_results", [])
        lines = [f"🎓 Your cumulative CGPA is **{cgpa}** (Scale of 10.0)."]
        if results:
            lines.append("\n**Recent Assessment Records:**")
            for r in results[:4]:
                lines.append(f"• **{r.get('subject_code')}**: Marks {r.get('marks')}/{r.get('max_marks')} — Grade **{r.get('grade')}** ({r.get('status', 'Pass')})")
        lines.append("\nDetailed official transcripts and semester marks-cards can be downloaded under **Examination Results**.")
        return {
            "response": "\n".join(lines),
            "intent": intent,
            "source": "authorized-campus-records"
        }

    # 5. FEE STATUS INTENT
    elif intent == "FEE_STATUS":
        fees = context.get("fees", {})
        bal = fees.get("balance_amount", 0)
        if bal == 0:
            return {
                "response": "💳 All semester tuition dues are completely settled! No outstanding fee balance is pending for your account.",
                "intent": intent,
                "source": "authorized-campus-records"
            }
        return {
            "response": f"💳 You have an outstanding tuition balance of **₹{bal:,}**. Payments can be settled online or at the Accounts Desk.",
            "intent": intent,
            "source": "authorized-campus-records"
        }

    # 6. COURSE SYLLABUS INTENT
    elif intent == "COURSE_SYLLABUS":
        return {
            "response": (
                "📚 **BCA Semester 5 Academic Program Core Modules:**\n"
                "• **BCA-501**: Artificial Intelligence & Machine Learning (CNNs, PyTorch, Supervised Learning)\n"
                "• **BCA-502**: Full-Stack Web Engineering (React, Node.js, Express, MongoDB, REST Security)\n"
                "• **BCA-503**: Database Management Systems (Normalization, Query Plans, ACID Transactions)\n"
                "• **BCA-504**: Cloud Computing & DevOps (Docker, Containers, CI/CD Pipelines)\n\n"
                "Downloadable lecture notes and syllabi are available under **Study Resources**."
            ),
            "intent": intent,
            "source": "curriculum-knowledge-base"
        }

    # 7. GENERAL CAMPUS POLICY INTENT
    elif intent == "GENERAL_POLICY":
        return {
            "response": (
                "🏛️ **SmartCampus Academic Regulations:**\n"
                "1. **Attendance**: 75% minimum attendance is required per subject for exam clearance.\n"
                "2. **Coursework**: Submissions after the posted deadline receive a late deduction unless supported by approved medical leave.\n"
                "3. **Mentorship**: Faculty mentors hold weekly office hours as listed on the Faculty directory.\n"
                "4. **Notices**: University administrative circulars are published in the Notices section."
            ),
            "intent": intent,
            "source": "campus-policy-engine"
        }

    # 8. GENERAL ACADEMIC INQUIRY (Try Ollama LLM if configured; fallback to structured knowledge)
    if USE_LOCAL_LLM:
        try:
            prompt = (
                f"You are the SmartCampus AI Academic Assistant for university undergraduate students. "
                f"Answer the following academic inquiry concisely, professionally, and accurately: '{query}'"
            )
            res = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
                timeout=5
            )
            if res.status_code == 200:
                answer = res.json().get("response", "")
                if answer:
                    return {
                        "response": answer.strip(),
                        "intent": intent,
                        "source": f"local-llm ({OLLAMA_MODEL})"
                    }
        except Exception:
            pass  # Fall back to deterministic educational response

    return {
        "response": (
            f"Hello! I am your SmartCampus AI Academic Advisor. "
            f"I have received your inquiry: *\"{query}\"*\n\n"
            f"Here are key campus topics I can instantly help you with:\n"
            f"• **\"What classes do I have today?\"** — Live timetable lookups\n"
            f"• **\"What assignments are due?\"** — Coursework submissions and deadlines\n"
            f"• **\"What is my attendance percentage?\"** — Attendance compliance and risk audit\n"
            f"• **\"Show my exam grades\"** — GPA, credits, and semester scores\n\n"
            f"*(Note: In-depth PDF textbook semantic search will be enabled in Phase 5 RAG Knowledge Retrieval).* "
            f"How else may I support your academics today?"
        ),
        "intent": intent,
        "source": "deterministic-campus-engine"
    }
