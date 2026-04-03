# Simulated consultation test — Lynol (teacher) & David (student)

Use this as a **read-through** before a real session in Polycon. Two people play the roles; then Lynol enters the structured fields in the app the way you would after an actual consultation.

---

## Cast


| Role    | Name  |
| ------- | ----- |
| Faculty | Lynol |
| Student | David |


---

## Scene setup

- **Where:** Consultation room / online call — same as your real booking.
- **When:** Pretend this is the confirmed slot you booked in Polycon.
- **Tone:** Calm, professional, supportive.

---

## Script (read in order)

**David:** Hi Lynol, thanks for meeting me. I’m okay on lectures, but when we hit trees and graphs I get lost. I especially mix up the traversal orders — preorder, inorder, postorder — and I’m not sure when to use an adjacency list versus a matrix.

**Lynol:** Thanks for saying that clearly. Let’s slow it down. Picture a small binary tree on the board: root A, left B, right C, and we’ll walk preorder first — root, then left subtree, then right subtree. I’ll label each visit step by step; you tell me the sequence as we go.

**David:** Okay… so we visit A first, then we go left to B, and C is on the right of A.

**Lynol:** Right. For preorder we print A, then everything under B before we come back to the right side of A. Let’s do one example with numbers so it sticks. For graphs, think “what am I storing?” If the graph is sparse — few edges — an adjacency list is usually enough and easier to iterate. If you need “is there an edge from i to j?” in O(1), a matrix can help, but it costs more memory.

**David:** That helps. I was cramming both at once. I think I need more practice just on traversals first.

**Lynol:** Good plan. I’ll point you to three practice problems in the lab guide and my posted notes. Try them before next lab; if you’re stuck on one step, email me which line — don’t wait until the night before the quiz.

**David:** Will do. I feel clearer on *why* I was confused, not just that I was failing quizzes.

**Lynol:** That’s progress. Let’s touch base after the next lab — if you’re still below where you want to be, we can talk about peer tutoring or an extra drill session.

**David:** Thanks, Lynol.

**Lynol:** You’re welcome, David. Good luck with the practice set.

---

## What Lynol enters in Polycon (structured fields)

Use these as the **Concern**, **Action taken**, **Outcome**, and **Remarks** when you document the session (adjust wording if your real conversation differs).

**Concern**

> David is having difficulty with midterm-level data structures, especially tree traversals (preorder, inorder, postorder) and when to represent graphs with an adjacency list versus an adjacency matrix.

**Action taken**

> Walked through a small binary tree and labeled preorder traversal step by step; explained adjacency list vs matrix tradeoffs (memory vs fast edge lookup). Directed David to three practice problems in the lab guide and posted notes; asked him to email specific stumbling steps instead of waiting until the last minute.

**Outcome**

> David reported feeling clearer on traversals and graph basics and will complete the practice set before the next lab. Agreed to follow up after the lab; discussed peer tutoring or extra drills if grades are still below target.

**Remarks**

> Check in after the next lab session. If performance is still weak, consider formal peer tutoring referral.

---

## After the roleplay

1. Book or use a **real** appointment in Polycon for Lynol and David (or your actual accounts).
2. Run the **real** consultation using this scenario or a similar one.
3. Enter the fields above (updated to match what you **actually** said).
4. As David, confirm the session appears in **History** with the same details.

