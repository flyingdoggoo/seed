# Postman Test Guide

This guide provides the exact API endpoints and sample UUIDs from the seeded database to test the roundtable room feature using Postman.

> [!NOTE]
> This file is dynamically generated after each seeder run, so these URLs and UUIDs are guaranteed to be valid for your current database state.

## 1. Authentication
To hit the endpoints, you must include a valid Bearer token in the `Authorization` header.
- **Header:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Test Account (Line Manager):** Log in as `nguyenthanhhieu17022005@ehub.enosta.com` to obtain the token.
- **Test Account (HR Admin):** Log in as `hr@ehub.enosta.com` to obtain the token.

---

## 2. API Endpoints & Sample URLs

### A. View Roundtable Session List as Participant
* **Method:** `GET`
* **URL Format:** `http://localhost:3000/api/v1/roundtable-sessions/me`
* **Sample URL (Active Test Cycle):**
  ```
  GET http://localhost:3000/api/v1/roundtable-sessions/me?cycleId=cmrognis601d3487kn3hxcf6d
  ```

### B. Get Reviewees List in Roundtable Session
* **Method:** `GET`
* **URL Format:** `http://localhost:3000/api/v1/roundtable-sessions/:sessionId/reviewees`

### C. View Evidence Matrix by Criterion
* **Method:** `GET`
* **URL Format:** `http://localhost:3000/api/v1/roundtable-sessions/:sessionId/reviewees/:revieweeId/evidence`

### D. Save/Update Calibrated Criterion Scores
* **Method:** `PATCH`
* **URL Format:** `http://localhost:3000/api/v1/roundtable-sessions/:sessionId/reviewees/:revieweeId/scores`

### E. Finalize and Complete Roundtable Session
* **Method:** `POST`
* **URL Format:** `http://localhost:3000/api/v1/roundtable-sessions/:sessionId/complete`

---

## 3. Sample Postman URLs for Active Cycles

1. **Scheduled Session (Roundtable EG BACK OFFICE — Q3 2026 PR Cycle):**
   - **Get Reviewees URL:**
     ```
     GET http://localhost:3000/api/v1/roundtable-sessions/cmrognyq50lwg487kqn2zd4pa/reviewees
     ```
   - **View Evidence Matrix URL:**
     - **Reviewee:** Trang Tran (ID: cmrogn9jq003v487kl6dv7v7q)
     ```
     GET http://localhost:3000/api/v1/roundtable-sessions/cmrognyq50lwg487kqn2zd4pa/reviewees/cmrogn9jq003v487kl6dv7v7q/evidence
     ```
   - **Save Calibrated Scores URL:**
     ```
     PATCH http://localhost:3000/api/v1/roundtable-sessions/cmrognyq50lwg487kqn2zd4pa/reviewees/cmrogn9jq003v487kl6dv7v7q/scores
     ```
     - **Sample Body:**
       ```json
       {
         "scores": [
           {
             "criterionId": "cmrognhbm00ib487kuis6e1lc",
             "score": 4,
             "feedback": "Strong performance, met expectations."
           },
           {
             "criterionId": "cmrognhbo00ic487khu2tto5p",
             "score": 5,
             "feedback": "Exceptional productivity and quality."
           }
         ]
       }
       ```
   - **Complete Roundtable Session URL:**
     ```
     POST http://localhost:3000/api/v1/roundtable-sessions/cmrognyq50lwg487kqn2zd4pa/complete
     ```


