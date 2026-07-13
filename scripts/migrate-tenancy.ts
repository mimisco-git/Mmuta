/**
 * Phase 2 – Multi-tenancy backfill script
 *
 * Run once against an existing database that pre-dates multi-tenancy:
 *   DATABASE_URL="file:./dev.db" npx ts-node --esm scripts/migrate-tenancy.ts
 *   or
 *   DATABASE_URL="libsql://..." npx ts-node --esm scripts/migrate-tenancy.ts
 *
 * What it does:
 *   1. Ensures a "FUTO" school row exists (the legacy tenant).
 *   2. Backfills schoolId="" rows on every newly-added FK column, deriving
 *      the correct ID from the nearest already-scoped parent.
 *   3. Prints before/after counts for every model so you can verify.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Ensure legacy school exists ───────────────────────────
  let legacySchool = await prisma.school.findFirst({ where: { code: "FUTO" } });
  if (!legacySchool) {
    legacySchool = await prisma.school.create({
      data: {
        name: "Federal University of Technology Owerri",
        code: "FUTO",
        email: "admin@futo.edu.ng",
        isActive: true,
        creditBalance: 1000,
      },
    });
    console.log(`Created legacy school: ${legacySchool.name} (${legacySchool.id})`);
  } else {
    console.log(`Found legacy school: ${legacySchool.name} (${legacySchool.id})`);
  }

  const legacyId = legacySchool.id;

  // ── 2. Helper: count unscoped rows ───────────────────────────
  const countUnscoped = async (model: string) => {
    const result = await prisma.$queryRawUnsafe<{ n: number }[]>(
      `SELECT COUNT(*) AS n FROM "${model}" WHERE schoolId = ''`
    );
    return Number(result[0]?.n ?? 0);
  };

  // ── 3. Print before counts ────────────────────────────────────
  const models = ["Exam", "ExamSubmission", "LectureNote", "Quiz", "Question", "StudentAttempt", "Assignment", "AssignmentSubmission", "BankQuestion"];
  console.log("\n── Before counts (unscoped rows) ──");
  for (const m of models) {
    console.log(`  ${m}: ${await countUnscoped(m)} unscoped`);
  }

  // ── 4. Backfill each model ────────────────────────────────────

  // Exam → course.schoolId
  const exams = await prisma.exam.findMany({ where: { schoolId: "" }, include: { course: { select: { schoolId: true } } } });
  for (const e of exams) {
    await prisma.exam.update({ where: { id: e.id }, data: { schoolId: e.course.schoolId || legacyId } });
  }
  console.log(`\nBackfilled ${exams.length} Exam rows`);

  // Quiz → course.schoolId
  const quizzes = await prisma.quiz.findMany({ where: { schoolId: "" }, include: { course: { select: { schoolId: true } } } });
  for (const q of quizzes) {
    await prisma.quiz.update({ where: { id: q.id }, data: { schoolId: q.course.schoolId || legacyId } });
  }
  console.log(`Backfilled ${quizzes.length} Quiz rows`);

  // LectureNote → course.schoolId
  const notes = await prisma.lectureNote.findMany({ where: { schoolId: "" }, include: { course: { select: { schoolId: true } } } });
  for (const n of notes) {
    await prisma.lectureNote.update({ where: { id: n.id }, data: { schoolId: n.course.schoolId || legacyId } });
  }
  console.log(`Backfilled ${notes.length} LectureNote rows`);

  // Question → quiz.course.schoolId
  const questions = await prisma.question.findMany({ where: { schoolId: "" }, include: { quiz: { include: { course: { select: { schoolId: true } } } } } });
  for (const q of questions) {
    await prisma.question.update({ where: { id: q.id }, data: { schoolId: q.quiz.course.schoolId || legacyId } });
  }
  console.log(`Backfilled ${questions.length} Question rows`);

  // StudentAttempt → student.schoolId
  const attempts = await prisma.studentAttempt.findMany({ where: { schoolId: "" }, include: { student: { select: { schoolId: true } } } });
  for (const a of attempts) {
    await prisma.studentAttempt.update({ where: { id: a.id }, data: { schoolId: a.student.schoolId || legacyId } });
  }
  console.log(`Backfilled ${attempts.length} StudentAttempt rows`);

  // ExamSubmission → student.schoolId
  const examSubs = await prisma.examSubmission.findMany({ where: { schoolId: "" }, include: { student: { select: { schoolId: true } } } });
  for (const s of examSubs) {
    await prisma.examSubmission.update({ where: { id: s.id }, data: { schoolId: s.student.schoolId || legacyId } });
  }
  console.log(`Backfilled ${examSubs.length} ExamSubmission rows`);

  // Assignment → course.schoolId
  const assignments = await prisma.assignment.findMany({ where: { schoolId: "" }, include: { course: { select: { schoolId: true } } } });
  for (const a of assignments) {
    await prisma.assignment.update({ where: { id: a.id }, data: { schoolId: a.course.schoolId || legacyId } });
  }
  console.log(`Backfilled ${assignments.length} Assignment rows`);

  // AssignmentSubmission → student.schoolId
  const assignSubs = await prisma.assignmentSubmission.findMany({ where: { schoolId: "" }, include: { student: { select: { schoolId: true } } } });
  for (const s of assignSubs) {
    await prisma.assignmentSubmission.update({ where: { id: s.id }, data: { schoolId: s.student.schoolId || legacyId } });
  }
  console.log(`Backfilled ${assignSubs.length} AssignmentSubmission rows`);

  // BankQuestion → lecturer.schoolId
  const bankQs = await prisma.bankQuestion.findMany({ where: { schoolId: "" }, include: { lecturer: { select: { schoolId: true } } } });
  for (const q of bankQs) {
    await prisma.bankQuestion.update({ where: { id: q.id }, data: { schoolId: q.lecturer.schoolId || legacyId } });
  }
  console.log(`Backfilled ${bankQs.length} BankQuestion rows`);

  // ── 5. After counts ───────────────────────────────────────────
  console.log("\n── After counts (unscoped rows remaining) ──");
  for (const m of models) {
    const n = await countUnscoped(m);
    console.log(`  ${m}: ${n} unscoped${n > 0 ? " ⚠️  check manually" : " ✓"}`);
  }

  console.log("\n✅  Tenancy backfill complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
