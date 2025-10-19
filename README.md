# CSE327 Project : University E-Voting System
# 🗳️ University E-Voting System  

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Development-blue)

A secure, transparent, and user-friendly **web-based electronic voting platform** designed for universities.  
It enables administrators to create and manage elections, students to vote online once anonymously, and the public to view results — all through a centralized and protected system.

---

## 🎯 Project Overview  

The **University E-Voting System** modernizes the traditional paper-based voting process.  
It ensures **fairness**, **security**, and **anonymity** while simplifying election management for administrators and providing accessibility for students.

### Key Goals  
- Prevent duplicate or fraudulent votes  
- Maintain voter privacy and data integrity  
- Deliver instant, accurate results  
- Provide transparency through verifiable audit logs  

---

## ⚙️ Key Features  

### 👩‍💼 Admin Panel  
- Create and manage elections  
- Approve or reject candidate applications  
- Upload and verify voter lists  
- Generate secure, one-time voting tokens  
- Publish election results instantly  

### 👨‍🎓 Voter Portal  
- Secure login with university credentials  
- Cast a single anonymous vote  
- Receive confirmation after successful submission  

### 🧾 Non-Identifying Audit Logs  
The system automatically records important activities — such as votes being cast or results being published — **without storing any voter’s identity or vote choice**.  
This ensures full transparency **without breaking voter anonymity**.

**Example:**
✅ *No personal data (like voter name or ID) is ever logged.*

---

## 🧰 Tech Stack  

**Frontend:** Next.js / React / Tailwind CSS  
**Backend:** Node.js (Express or Next API Routes)  
**Database:** PostgreSQL or MySQL  
**Hosting:** Render / Vercel / Netlify  
**Authentication:** JWT / Token-based Voter Verification  
**Security:** SSL/TLS Encryption, Hashed Tokens, Role-Based Access Control  

---
🔐 Security & Privacy

Each voter receives a unique one-time token for voting.

Tokens are validated and marked as “used” after submission.

Audit logs capture important actions but never link them to voter identities.

All passwords and sensitive data are encrypted and hashed using secure algorithms.

📊 System Workflow

Admin creates election and approves candidates.

Voters log in using university credentials and receive secure tokens.

Votes are cast and stored anonymously in the database.

System automatically calculates and displays results.

Non-identifying audit logs record every key event for transparency.

🧪 Testing & Validation

Unit Testing: Token generation, authentication, and result calculation.

Integration Testing: End-to-end flow from login → vote → result.

Security Testing: Validate against SQL Injection / XSS / Replay attacks.

User Acceptance Testing: Conducted with sample university users.

🧠 Future Enhancements

Add blockchain-based vote verification for enhanced trust.

Develop mobile apps (Android / iOS) for easier access.

Implement live result dashboards and statistical analytics.

Introduce biometric verification for admin login.
