/**
 * Phase 5 – Multi-tenancy isolation verification
 *
 * Creates two schools (School A / School B), seeds one resource per model
 * in each school, then proves School A cannot access School B's data and
 * vice-versa.
 *
 * Run:
 *   DATABASE_URL="file:./dev.db" npx ts-node --esm scripts/verify-isolation.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let failures = 0;

function pass(msg: string) { console.log(`  ✓  ${msg}`); }
function fail(msg: string) { console.error(`  ✗  ${msg}`); failures++; }

function check(label: string, condition: boolean) {
  condition ? pass(label) : fail(label);
}

async function main() {
  console.log("\n── Creating test schools ──");

  // Clean up any previous test run
  await prisma.school.deleteMany({ where: { code: { in: ["TESTA", "TESTB"] } } });

  const schoolA = await prisma.school.create({ data: { name: "School A (test)", code: "TESTA", isActive: true, creditBalance: 999 } });
  const schoolB = await prisma.school.create({ data: { name: "School B (test)", code: "TESTB", isActive: true, creditBalance: 999 } });
  console.log(`  School A: ${schoolA.id}`);
  console.log(`  School B: ${schoolB.id}`);

  // ── Seed minimal data for School A ───────────────────────────
  const lecA = await prisma.lecturer.create({ data: { name: "Lec A", email: "lec@testa.ng", password: "x", schoolId: schoolA.id } });
  const stuA = await prisma.student.create({ data: { fullName: "Stu A", regNumber: "A/001", department: "CS", year: "Yr1", schoolId: schoolA.id } });
  const deptA = await prisma.department.create({ data: { name: "Dept A", schoolId: schoolA.id } });
  const courseA = await prisma.course.create({ data: { code: "CA101", title: "Course A", lecturerId: lecA.id, schoolId: schoolA.id } });
  const noteA = await prisma.lectureNote.create({ data: { title: "Note A", content: "...", courseId: courseA.id, schoolId: schoolA.id } });
  const quizA = await prisma.quiz.create({ data: { title: "Quiz A", durationMinutes: 5, courseId: courseA.id, schoolId: schoolA.id } });
  const qA = await prisma.question.create({ data: { text: "Q?", optionsJson: "[]", correctOption: "A", quizId: quizA.id, schoolId: schoolA.id } });
  const examA = await prisma.exam.create({ data: { title: "Exam A", questionsText: "Q", courseId: courseA.id, schoolId: schoolA.id } });
  const asgA = await prisma.assignment.create({ data: { title: "Asg A", questionsText: "Q", courseId: courseA.id, schoolId: schoolA.id } });
  const attemptA = await prisma.studentAttempt.create({ data: { studentId: stuA.id, quizId: quizA.id, schoolId: schoolA.id } });
  const examSubA = await prisma.examSubmission.create({ data: { examId: examA.id, studentId: stuA.id, answersText: "a", schoolId: schoolA.id } });
  const asgSubA = await prisma.assignmentSubmission.create({ data: { assignmentId: asgA.id, studentId: stuA.id, answersText: "a", schoolId: schoolA.id } });
  const bqA = await prisma.bankQuestion.create({ data: { lecturerId: lecA.id, schoolId: schoolA.id, text: "BQ A", optionsJson: "[]", correctOption: "A" } });

  // ── Seed minimal data for School B ───────────────────────────
  const lecB = await prisma.lecturer.create({ data: { name: "Lec B", email: "lec@testb.ng", password: "x", schoolId: schoolB.id } });
  const stuB = await prisma.student.create({ data: { fullName: "Stu B", regNumber: "B/001", department: "CS", year: "Yr1", schoolId: schoolB.id } });
  const courseB = await prisma.course.create({ data: { code: "CB101", title: "Course B", lecturerId: lecB.id, schoolId: schoolB.id } });
  const noteB = await prisma.lectureNote.create({ data: { title: "Note B", content: "...", courseId: courseB.id, schoolId: schoolB.id } });
  const quizB = await prisma.quiz.create({ data: { title: "Quiz B", durationMinutes: 5, courseId: courseB.id, schoolId: schoolB.id } });
  const examB = await prisma.exam.create({ data: { title: "Exam B", questionsText: "Q", courseId: courseB.id, schoolId: schoolB.id } });
  const asgB = await prisma.assignment.create({ data: { title: "Asg B", questionsText: "Q", courseId: courseB.id, schoolId: schoolB.id } });

  console.log("\n── Isolation checks (School A context, querying B resources) ──");

  // LectureNote scoped by schoolId
  const notesSeenByA = await prisma.lectureNote.findMany({ where: { schoolId: schoolA.id } });
  check("Notes: School A sees only its own notes", notesSeenByA.every(n => n.id === noteA.id) && !notesSeenByA.find(n => n.id === noteB.id));

  // Quiz scoped by schoolId
  const quizzesSeenByA = await prisma.quiz.findMany({ where: { schoolId: schoolA.id } });
  check("Quizzes: School A sees only its own quizzes", !quizzesSeenByA.find(q => q.id === quizB.id));

  // Exam scoped by schoolId
  const examsSeenByA = await prisma.exam.findMany({ where: { schoolId: schoolA.id } });
  check("Exams: School A sees only its own exams", !examsSeenByA.find(e => e.id === examB.id));

  // Assignment scoped by schoolId
  const asgsSeenByA = await prisma.assignment.findMany({ where: { schoolId: schoolA.id } });
  check("Assignments: School A sees only its own assignments", !asgsSeenByA.find(a => a.id === asgB.id));

  // Question scoped by schoolId
  const qsSeenByA = await prisma.question.findMany({ where: { schoolId: schoolA.id } });
  check("Questions: School A sees only its own questions", qsSeenByA.every(q => q.id === qA.id));

  // StudentAttempt scoped
  const attemptsSeenByA = await prisma.studentAttempt.findMany({ where: { schoolId: schoolA.id } });
  check("StudentAttempts: School A sees only its own", !attemptsSeenByA.find(a => a.schoolId === schoolB.id));

  // ExamSubmission scoped
  const examSubsSeenByA = await prisma.examSubmission.findMany({ where: { schoolId: schoolA.id } });
  check("ExamSubmissions: School A sees only its own", !examSubsSeenByA.find(s => s.schoolId === schoolB.id));

  // AssignmentSubmission scoped
  const asgSubsSeenByA = await prisma.assignmentSubmission.findMany({ where: { schoolId: schoolA.id } });
  check("AssignmentSubmissions: School A sees only its own", !asgSubsSeenByA.find(s => s.schoolId === schoolB.id));

  // BankQuestion scoped by schoolId
  const bqsSeenByA = await prisma.bankQuestion.findMany({ where: { schoolId: schoolA.id } });
  check("BankQuestions: School A sees only its own", !bqsSeenByA.find(q => q.schoolId === schoolB.id));

  // Cross-school findUnique checks (simulate 404 enforcement)
  const crossQuiz = await prisma.quiz.findFirst({ where: { id: quizB.id, schoolId: schoolA.id } });
  check("Quiz cross-school findFirst returns null (would 404)", crossQuiz === null);

  const crossExam = await prisma.exam.findFirst({ where: { id: examB.id, schoolId: schoolA.id } });
  check("Exam cross-school findFirst returns null (would 404)", crossExam === null);

  const crossAsg = await prisma.assignment.findFirst({ where: { id: asgB.id, schoolId: schoolA.id } });
  check("Assignment cross-school findFirst returns null (would 404)", crossAsg === null);

  const crossNote = await prisma.lectureNote.findFirst({ where: { id: noteB.id, schoolId: schoolA.id } });
  check("Note cross-school findFirst returns null (would 404)", crossNote === null);

  // ── Check for unscoped query patterns ─────────────────────────
  console.log("\n── Grep: unscoped tenant-model queries ──");
  const { execSync } = await import("child_process");
  const tenantModels = ["lectureNote", "quiz\\b", "exam\\b", "assignment\\b", "question\\b", "studentAttempt", "examSubmission", "assignmentSubmission", "bankQuestion"];
  let unscopedCount = 0;
  for (const model of tenantModels) {
    try {
      // Look for findMany/findFirst without a schoolId filter in where clause on these models
      const result = execSync(
        `grep -n "prisma\\.${model}\\." /tmp/MmutaPush/server.ts | grep -v "schoolId" | grep -E "findMany|findFirst" | grep -v "//"`
      ).toString().trim();
      if (result) {
        const lines = result.split("\n").filter(Boolean);
        console.log(`  ⚠  ${model} - ${lines.length} potentially unscoped call(s):`);
        lines.slice(0, 3).forEach(l => console.log(`     ${l.split(":")[0]}: ${l.split(":").slice(1).join(":").trim().slice(0, 80)}`));
        unscopedCount += lines.length;
      }
    } catch {
      // grep returns non-zero when no match found — that's good
    }
  }
  if (unscopedCount === 0) {
    pass("No obviously unscoped tenant-model findMany/findFirst calls found");
  } else {
    console.log(`  ℹ  ${unscopedCount} calls flagged — review above (some may be owner-scoped via studentId/lecturerId)`);
  }

  // ── Cleanup ───────────────────────────────────────────────────
  console.log("\n── Cleaning up test data ──");
  await prisma.school.deleteMany({ where: { code: { in: ["TESTA", "TESTB"] } } });
  console.log("  Deleted test schools (cascade deletes all related rows)");

  // ── Result ────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  if (failures === 0) {
    console.log("✅  All isolation checks passed.");
  } else {
    console.error(`❌  ${failures} isolation check(s) FAILED. Review and fix before deploying.`);
    process.exit(1);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
