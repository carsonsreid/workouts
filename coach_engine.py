import os
import json
import datetime
import urllib.request

DB_FILE = os.path.join(os.path.dirname(__file__), "coach_db.json")

# Default 5-Day Hybrid Routine Templates (Nippard, Cavaliere, Huberman, Johnson)
ROUTINE_TEMPLATES = {
    "mon_lower_knee": {
        "name": "Monday: Lower Body Strength & Knee Remediation",
        "modality": "strength",
        "tagline": "Poliquin step-ups, HSR squatting, Landmine RDLs & patellar tendon analgesia",
        "exercises": [
            {"name": "Isometric Wall Sit (45s Analgesia)", "sets": 1, "reps": 1, "weight_kg": 0, "notes": "45s hold at 60° knee flexion to release motor unit inhibition"},
            {"name": "Poliquin Step-Up (Heel Elevated)", "sets": 2, "reps": 12, "weight_kg": 0, "notes": "Target terminal extension & VMO for patellar stability"},
            {"name": "Barbell Back Squat (HSR 3s Eccentric)", "sets": 2, "reps": 6, "weight_kg": 95, "notes": "Slow 3-4s eccentric phase for Heavy Slow Resistance tendon remodeling"},
            {"name": "Landmine Romanian Deadlift", "sets": 2, "reps": 10, "weight_kg": 60, "notes": "Landmine arc naturally guides hip hinge while sparing lumbar spine"}
        ]
    },
    "tue_recovery": {
        "name": "Tuesday: Travel Recovery & Contrast Therapy",
        "modality": "cardio",
        "tagline": "20-30 min Zone 2 Rowing + Sauna/Cold Plunge contrast ending on cold (Søberg Principle)",
        "cardio": {
            "target_distance_km": 4.0,
            "target_pace": "5:30 /km",
            "hr_zone": "Zone 2 (130-145 BPM)"
        }
    },
    "wed_upper": {
        "name": "Wednesday: Upper Body Hypertrophy & Posture",
        "modality": "strength",
        "tagline": "Weighted ring pull-ups, DB bench with lengthened partials, face pulls & core fallouts",
        "exercises": [
            {"name": "Weighted Ring Pull-Up", "sets": 2, "reps": 8, "weight_kg": 10, "notes": "Gymnastic rings allow natural wrist rotation to minimize shoulder stress"},
            {"name": "Dumbbell Bench Press (Lengthened Partials)", "sets": 2, "reps": 10, "weight_kg": 34, "notes": "Emphasize deep stretch at bottom position for mechanical tension"},
            {"name": "High-to-Low Banded Face Pull", "sets": 3, "reps": 15, "weight_kg": 15, "notes": "Underhand thumbs-back grip into 90/90 goalpost finish"}
        ]
    },
    "fri_vo2max": {
        "name": "Friday: VO2 Max Norwegian 4x4 & Core",
        "modality": "cardio",
        "tagline": "Rowing HIIT (4x4 min at 90-95% HR max) + Pallof press anti-rotation core",
        "cardio": {
            "target_distance_km": 5.0,
            "target_pace": "4:45 /km",
            "hr_zone": "Zone 5 Norwegian 4x4 (170-185 BPM)"
        },
        "exercises": [
            {"name": "Cable Pallof Press (Anti-Rotation)", "sets": 3, "reps": 10, "weight_kg": 20, "notes": "Resist rotational torque to bulletproof lumbar spine"}
        ]
    },
    "sun_autonomic": {
        "name": "Sunday: Family Yoga & Autonomic Reset",
        "modality": "yoga",
        "tagline": "15 min static stretching (30-40% pain threshold) + 20 min NSDR / Yoga Nidra",
        "yoga": [
            {"name": "Downward-Facing Dog", "duration_sec": 120, "notes": "Pedal feet for hamstring extensibility"},
            {"name": "Child Pose Savasana (Diaphragmatic Breath)", "duration_sec": 300, "notes": "Deep diaphragmatic breathing to trigger parasympathetic dominance"}
        ]
    }
}

class CoachEngine:
    def __init__(self):
        self.data = self._load_db()

    def _load_db(self):
        if os.path.exists(DB_FILE):
            try:
                with open(DB_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "schedule": {},
            "logs": [],
            "config": {
                "google_sheets_webhook": ""
            }
        }

    def _save_db(self):
        with open(DB_FILE, "w") as f:
            json.dump(self.data, f, indent=2)

    def load_schedule_for_month(self, year=None, month=None):
        """Populates the workout schedule for an entire month using the 5-day protocol split."""
        now = datetime.datetime.now()
        year = year or now.year
        month = month or now.month

        # Generate all days in month
        first_day = datetime.date(year, month, 1)
        if month == 12:
            next_month = datetime.date(year + 1, 1, 1)
        else:
            next_month = datetime.date(year, month + 1, 1)

        num_days = (next_month - first_day).days

        for day in range(1, num_days + 1):
            date_obj = datetime.date(year, month, day)
            iso_date = date_obj.isoformat()
            weekday = date_obj.weekday() # 0 = Mon, 6 = Sun

            if iso_date not in self.data["schedule"]:
                if weekday == 0:
                    self.data["schedule"][iso_date] = ROUTINE_TEMPLATES["mon_lower_knee"]
                elif weekday == 1:
                    self.data["schedule"][iso_date] = ROUTINE_TEMPLATES["tue_recovery"]
                elif weekday == 2:
                    self.data["schedule"][iso_date] = ROUTINE_TEMPLATES["wed_upper"]
                elif weekday == 4:
                    self.data["schedule"][iso_date] = ROUTINE_TEMPLATES["fri_vo2max"]
                elif weekday == 6:
                    self.data["schedule"][iso_date] = ROUTINE_TEMPLATES["sun_autonomic"]
                else:
                    self.data["schedule"][iso_date] = {"name": "Rest & Active Recovery", "modality": "rest", "tagline": "Family play & NEAT focus"}

        self._save_db()
        return len(self.data["schedule"])

    def get_today_workout(self):
        today_iso = datetime.date.today().isoformat()
        if today_iso not in self.data["schedule"]:
            self.load_schedule_for_month()
        return self.data["schedule"].get(today_iso, ROUTINE_TEMPLATES["mon_lower_knee"])

    def log_workout_session(self, routine_name, modality, duration_mins, total_volume_kg, notes="", ai_review=""):
        log_entry = {
            "id": f"log-{int(datetime.datetime.now().timestamp())}",
            "date": datetime.datetime.now().isoformat(),
            "routine_name": routine_name,
            "modality": modality,
            "duration_minutes": duration_mins,
            "total_volume_kg": total_volume_kg,
            "notes": notes,
            "ai_review": ai_review or f"⚡ Session logged! {total_volume_kg} kg total volume in {duration_mins} mins."
        }
        self.data["logs"].insert(0, log_entry)

        # Mark today's schedule as completed
        today_iso = datetime.date.today().isoformat()
        if today_iso in self.data["schedule"]:
            self.data["schedule"][today_iso]["status"] = "DONE"

        self._save_db()

        # Push to Google Sheets webhook if configured
        webhook_url = self.data.get("config", {}).get("google_sheets_webhook")
        if webhook_url:
            try:
                req = urllib.request.Request(
                    webhook_url,
                    data=json.dumps(log_entry).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                urllib.request.urlopen(req, timeout=5)
            except Exception:
                pass

        return log_entry

    def generate_html_artifact(self):
        """Generates a pristine single-file Apple-style HTML UI view of today's workout and weekly schedule."""
        today_workout = self.get_today_workout()
        today_iso = datetime.date.today().isoformat()
        logs = self.data.get("logs", [])

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PULSE AI Coach - Today's Workout</title>
    <style>
        :root {{
            --bg-color: #F5F5F7;
            --apple-blue: #0071E3;
            --apple-green: #34C759;
            --card-bg: rgba(255, 255, 255, 0.9);
            --text-primary: #1D1D1F;
            --text-secondary: #86868B;
            --radius-lg: 20px;
            --radius-md: 14px;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg-color);
            color: var(--text-primary);
            margin: 0;
            padding: 32px 20px;
            display: flex;
            justify-content: center;
        }}
        .container {{
            width: 100%;
            max-width: 800px;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }}
        .badge {{
            background: rgba(0, 113, 227, 0.1);
            color: var(--apple-blue);
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: uppercase;
        }}
        .card {{
            background: var(--card-bg);
            backdrop-filter: blur(28px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: var(--radius-lg);
            padding: 28px;
            margin-bottom: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }}
        h1 {{
            font-size: 1.8rem;
            font-weight: 800;
            margin: 8px 0 4px;
            letter-spacing: -0.02em;
        }}
        p {{
            font-size: 0.92rem;
            color: var(--text-secondary);
            margin: 0;
        }}
        .exercise-box {{
            background: rgba(245, 247, 250, 0.9);
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-top: 14px;
        }}
        .exercise-name {{
            font-size: 1.05rem;
            font-weight: 700;
            margin-bottom: 4px;
        }}
        .exercise-notes {{
            font-size: 0.82rem;
            color: var(--text-secondary);
        }}
        .set-pill {{
            display: inline-block;
            background: #FFFFFF;
            border: 1px solid rgba(0,0,0,0.1);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 8px;
            margin-right: 6px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <span class="badge">Antigravity AI Fitness Coach</span>
                <h1>{today_workout.get('name')}</h1>
                <p>{today_workout.get('tagline')}</p>
            </div>
            <span class="badge" style="background: rgba(52, 199, 89, 0.1); color: var(--apple-green);">
                {today_iso}
            </span>
        </div>

        <div class="card">
            <h3 style="margin-top: 0;">Prescribed Workout Block</h3>
"""

        if today_workout.get("exercises"):
            for ex in today_workout["exercises"]:
                html_content += f"""
            <div class="exercise-box">
                <div class="exercise-name">{ex['name']}</div>
                <div class="exercise-notes">{ex.get('notes', '')}</div>
                <div>
                    <span class="set-pill">{ex.get('sets', 2)} Sets</span>
                    <span class="set-pill">{ex.get('reps', 10)} Reps</span>
                    <span class="set-pill">{ex.get('weight_kg', 0)} kg</span>
                </div>
            </div>
"""

        if today_workout.get("cardio"):
            c = today_workout["cardio"]
            html_content += f"""
            <div class="exercise-box">
                <div class="exercise-name">🏃 Cardio: {c.get('target_distance_km')} km</div>
                <div class="exercise-notes">Target Pace: {c.get('target_pace')} • HR Zone: {c.get('hr_zone')}</div>
            </div>
"""

        if today_workout.get("yoga"):
            for y in today_workout["yoga"]:
                html_content += f"""
            <div class="exercise-box">
                <div class="exercise-name">🧘 {y['name']}</div>
                <div class="exercise-notes">{y.get('notes', '')} • Duration: {y.get('duration_sec', 120)}s</div>
            </div>
"""

        html_content += f"""
        </div>

        <div class="card">
            <h3 style="margin-top: 0;">Recent Log History ({len(logs)})</h3>
"""

        for log in logs[:3]:
            html_content += f"""
            <div style="padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.06);">
                <div style="font-weight: 700; font-size: 0.95rem;">{log.get('routine_name')}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">{log.get('date')[:10]} • {log.get('duration_minutes')} mins • {log.get('total_volume_kg')} kg</div>
                <div style="font-size: 0.82rem; color: var(--apple-green); margin-top: 4px;">{log.get('ai_review')}</div>
            </div>
"""

        html_content += """
        </div>
    </div>
</body>
</html>
"""
        artifact_path = os.path.join(os.path.dirname(__file__), "today_workout.html")
        with open(artifact_path, "w") as f:
            f.write(html_content)
        return artifact_path

if __name__ == "__main__":
    engine = CoachEngine()
    engine.load_schedule_for_month()
    engine.generate_html_artifact()
    print("✓ Coach Engine Initialized. Workout Schedule loaded for current month.")
