from datetime import datetime
from functools import wraps

from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint
from werkzeug.security import generate_password_hash, check_password_hash

# ----------------------------------
# Flask & Database configuration
# ----------------------------------
app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-secret-key"  # change if you want
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///campuscast.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ----------------------------------
# Database Models
# ----------------------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="voter")  # only "voter" for now

    votes = db.relationship("Vote", backref="voter", lazy=True)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class Election(db.Model):
    __tablename__ = "elections"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    candidates = db.relationship("Candidate", backref="election", lazy=True)
    votes = db.relationship("Vote", backref="election", lazy=True)


class Candidate(db.Model):
    __tablename__ = "candidates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    manifesto = db.Column(db.Text, nullable=True)
    election_id = db.Column(db.Integer, db.ForeignKey("elections.id"), nullable=False)

    votes = db.relationship("Vote", backref="candidate", lazy=True)


class Vote(db.Model):
    __tablename__ = "votes"

    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    election_id = db.Column(db.Integer, db.ForeignKey("elections.id"), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidates.id"), nullable=False)
    cast_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("voter_id", "election_id", name="uix_voter_election"),
    )


# ----------------------------------
# Helper: login required decorator
# ----------------------------------
def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return redirect(url_for("login"))
        return view_func(*args, **kwargs)
    return wrapper


def get_current_user():
    uid = session.get("user_id")
    if not uid:
        return None
    return User.query.get(uid)


# ----------------------------------
# Seed demo elections & candidates
# ----------------------------------
def seed_demo_data():
    db.create_all()

    if Election.query.count() == 0:
        # Create demo elections
        e1 = Election(
            title="CSE Department Representative 2025",
            description="CSE বিভাগের প্রতিনিধি নির্বাচন।",
            start_time=datetime(2025, 12, 1, 9, 0),
            end_time=datetime(2025, 12, 1, 17, 0),
            is_active=True,
        )
        e2 = Election(
            title="University Senate Student Member",
            description="বিশ্ববিদ্যালয় সিনেট শিক্ষার্থীদের প্রতিনিধি নির্বাচন।",
            start_time=datetime(2025, 12, 5, 9, 0),
            end_time=datetime(2025, 12, 5, 17, 0),
            is_active=True,
        )
        db.session.add_all([e1, e2])
        db.session.commit()

        # Add candidates
        c1 = Candidate(
            name="Tamim Ahmed",
            department="CSE",
            manifesto="ল্যাব সুবিধা উন্নয়ন ও নতুন ইকুইপমেন্ট আনা।",
            election_id=e1.id,
        )
        c2 = Candidate(
            name="Imtiaz Ahmed",
            department="CSE",
            manifesto="স্টুডেন্ট ক্লাব ও ইভেন্টে আরও সাপোর্ট।",
            election_id=e1.id,
        )
        c3 = Candidate(
            name="Shishir",
            department="EEE",
            manifesto="ইলেকট্রিক্যাল ও ইলেকট্রনিক্স ডিপার্টমেন্টের ইন্টার-ডিপ্ট ইভেন্ট বাড়ানো।",
            election_id=e2.id,
        )
        c4 = Candidate(
            name="Rijan",
            department="CSE",
            manifesto="রিসার্চ ও ইনোভেশন ফান্ড বৃদ্ধি।",
            election_id=e2.id,
        )
        db.session.add_all([c1, c2, c3, c4])
        db.session.commit()


# ----------------------------------
# Routes: Home
# ----------------------------------
@app.route("/")
def home():
    # Simple redirect
    if "user_id" in session:
        return redirect(url_for("voter_dashboard"))
    return redirect(url_for("login"))


# ----------------------------------
# Routes: Register / Login / Logout
# ----------------------------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        student_id = request.form.get("student_id", "").strip()
        email = request.form.get("email", "").strip()
        department = request.form.get("department", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        # Basic checks
        if not all([full_name, student_id, email, department, password, confirm_password]):
            flash("সব ঘর পূরণ করা বাধ্যতামূলক।", "danger")
            return redirect(url_for("register"))

        if password != confirm_password:
            flash("পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।", "danger")
            return redirect(url_for("register"))

        if User.query.filter_by(student_id=student_id).first():
            flash("এই শিক্ষার্থী আইডি দিয়ে আগে থেকেই নিবন্ধন করা আছে।", "danger")
            return redirect(url_for("register"))

        if User.query.filter_by(email=email).first():
            flash("এই ইমেইল দিয়ে আগে থেকেই নিবন্ধন করা আছে।", "danger")
            return redirect(url_for("register"))

        user = User(
            full_name=full_name,
            student_id=student_id,
            email=email,
            department=department,
            role="voter",
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash("নিবন্ধন সম্পন্ন! এখন লগইন করুন।", "success")
        return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        student_id = request.form.get("student_id", "").strip()
        password = request.form.get("password", "")

        user = User.query.filter_by(student_id=student_id).first()

        if not user or not user.check_password(password):
            flash("ভুল শিক্ষার্থী আইডি বা পাসওয়ার্ড।", "danger")
            return redirect(url_for("login"))

        session["user_id"] = user.id
        flash("সফলভাবে লগইন হয়েছে।", "success")
        return redirect(url_for("voter_dashboard"))

    return render_template("login.html")


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    flash("আপনি লগআউট হয়েছেন।", "success")
    return redirect(url_for("login"))


# ----------------------------------
# Voter Dashboard
# ----------------------------------
@app.route("/voter/dashboard")
@login_required
def voter_dashboard():
    user = get_current_user()
    # active elections
    elections = Election.query.filter_by(is_active=True).all()
    # elections user has voted in
    user_votes = Vote.query.filter_by(voter_id=user.id).all()
    voted_ids = {v.election_id for v in user_votes}

    return render_template(
        "voter.html",
        user=user,
        elections=elections,
        voted_ids=voted_ids,
    )


# ----------------------------------
# Vote in an election
# ----------------------------------
@app.route("/voter/vote/<int:election_id>", methods=["GET", "POST"])
@login_required
def vote(election_id):
    user = get_current_user()
    election = Election.query.get_or_404(election_id)
    existing_vote = Vote.query.filter_by(
        voter_id=user.id,
        election_id=election.id
    ).first()

    if request.method == "POST":
        if existing_vote:
            flash("আপনি ইতিমধ্যেই এই নির্বাচনে ভোট দিয়েছেন।", "danger")
            return redirect(url_for("voter_result", election_id=election.id))

        candidate_id = request.form.get("candidate_id")
        if not candidate_id:
            flash("একজন প্রার্থী নির্বাচন করুন।", "danger")
            return redirect(url_for("vote", election_id=election.id))

        candidate = Candidate.query.filter_by(
            id=candidate_id,
            election_id=election.id
        ).first()
        if not candidate:
            flash("অবৈধ প্রার্থী নির্বাচন করা হয়েছে।", "danger")
            return redirect(url_for("vote", election_id=election.id))

        new_vote = Vote(
            voter_id=user.id,
            election_id=election.id,
            candidate_id=candidate.id,
        )
        db.session.add(new_vote)
        db.session.commit()

        flash("আপনার ভোট সফলভাবে রেকর্ড হয়েছে।", "success")
        return redirect(url_for("voter_result", election_id=election.id))

    return render_template(
        "vote.html",
        user=user,
        election=election,
        existing_vote=existing_vote,
    )


# ----------------------------------
# View election result
# ----------------------------------
@app.route("/voter/results/<int:election_id>")
@login_required
def voter_result(election_id):
    election = Election.query.get_or_404(election_id)

    votes = Vote.query.filter_by(election_id=election.id).all()
    total_votes = len(votes)

    results = []
    for c in election.candidates:
        count = Vote.query.filter_by(election_id=election.id, candidate_id=c.id).count()
        percent = (count / total_votes * 100) if total_votes > 0 else 0
        results.append({
            "candidate": c,
            "count": count,
            "percent": round(percent, 2),
        })

    results.sort(key=lambda x: x["count"], reverse=True)

    return render_template(
        "voter_result.html",
        election=election,
        results=results,
        total_votes=total_votes,
    )


# ----------------------------------
# Profile
# ----------------------------------
@app.route("/voter/profile")
@login_required
def voter_profile():
    user = get_current_user()
    return render_template("voter_profile.html", user=user)


# ----------------------------------
# Vote history
# ----------------------------------
@app.route("/voter/history")
@login_required
def vote_history():
    user = get_current_user()
    votes = Vote.query.filter_by(voter_id=user.id).all()
    return render_template("vote_history.html", votes=votes)


# ----------------------------------
# Run app
# ----------------------------------
if __name__ == "__main__":
    with app.app_context():
        seed_demo_data()
    app.run(debug=True)
