import { CycleStatus, RoleType } from "@prisma/client";
import { DemoConfig } from "../config";

/**
 * SINGLE SOURCE OF TRUTH for the showcase seed.
 *
 * Everything downstream (users, cycles, roundtables, perf-logs, calendar) reads
 * identities and the cycle matrix from here — instead of matching users by their
 * parenthesized fullName or referencing cycles by hardcoded names, which used to
 * break silently whenever a name changed.
 *
 * Rule 6 (no magic strings): cycle names, role scopes and hero identities live
 * here as named constants and are imported everywhere.
 */

// ─── Display-name helper ─────────────────────────────────────────────────────
// Data files keep the "(EHUB - PDO)" suffix so department can still be parsed
// from the name. This strips it for the value we actually store on User.fullName.
export function stripParens(fullName: string): string {
	return fullName.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

// ─── Hero accounts (env-driven via config.ts) ────────────────────────────────
// email      = login identity (@ehub.enosta.com work alias)
// larkEmail  = the address Lark actually resolves the account by (may differ)
// joinedAt   = drives EMPLOYEE_LIST_CHANGED eligibility; heroes join long ago so
//              they are always eligible for every cycle.
export interface ShowcaseAccount {
	fullName: string; // already clean (no parens)
	jobTitle: string;
	email: string;
	larkEmail: string;
	employeeCode: string;
	joinedAt: string;
	role: RoleType;
	departmentCode: string;
	lineManagerEmail: string | null;
}

export const HERO_LINE_MANAGER: ShowcaseAccount = {
	fullName: "Long Nguyen",
	jobTitle: DemoConfig.LINE_MANAGER.JOB_TITLE,
	email: DemoConfig.LINE_MANAGER.EMAIL, // manager@ehub.enosta.com
	larkEmail: DemoConfig.LINE_MANAGER.EMAIL,
	employeeCode: "EHUB002",
	joinedAt: "2000-07-10T00:00:00.000Z",
	role: RoleType.LINE_MANAGER,
	departmentCode: "PDO",
	lineManagerEmail: null,
};

export const HERO_PROJECT_MANAGER: ShowcaseAccount = {
	fullName: "Tung Nguyen",
	jobTitle: DemoConfig.PROJECT_MANAGER.JOB_TITLE,
	email: DemoConfig.PROJECT_MANAGER.EMAIL, // pm@ehub.enosta.com
	larkEmail: DemoConfig.PROJECT_MANAGER.EMAIL,
	employeeCode: "EHUB009",
	joinedAt: "1999-07-28T00:00:00.000Z",
	role: RoleType.PROJECT_MANAGER,
	departmentCode: "PMO",
	lineManagerEmail: HERO_LINE_MANAGER.email,
};

export const HERO_EMPLOYEE: ShowcaseAccount = {
	fullName: "Chuong Mai",
	jobTitle: DemoConfig.NON_MANAGEMENT_EMPLOYEE.JOB_TITLE,
	email: DemoConfig.NON_MANAGEMENT_EMPLOYEE.EMAIL, // employee@ehub.enosta.com
	larkEmail: DemoConfig.NON_MANAGEMENT_EMPLOYEE.EMAIL,
	employeeCode: "EHUB001",
	joinedAt: "2020-07-01T00:00:00.000Z",
	role: RoleType.EMPLOYEE,
	departmentCode: "FE",
	lineManagerEmail: HERO_LINE_MANAGER.email,
};

export const HERO_HR_ADMIN: ShowcaseAccount = {
	fullName: "HR Admin",
	jobTitle: DemoConfig.HR_ADMIN.JOB_TITLE,
	email: DemoConfig.HR_ADMIN.EMAIL, // hr@ehub.enosta.com
	larkEmail: DemoConfig.HR_ADMIN.EMAIL,
	employeeCode: "EHUB1000",
	// HR joined recently in the real export (2026-07-07); keep it early enough
	// that HR still lands as an eligible participant so admin views have context.
	joinedAt: "2023-01-01T00:00:00.000Z",
	role: RoleType.HR_ADMIN,
	departmentCode: "HRO",
	lineManagerEmail: null,
};

export const HERO_ACCOUNTS: ShowcaseAccount[] = [
	HERO_LINE_MANAGER,
	HERO_PROJECT_MANAGER,
	HERO_EMPLOYEE,
	HERO_HR_ADMIN,
];

// ─── Roundtable reviewers ────────────────────────────────────────────────────
// Long and Tung sit on every roundtable that exists, so HR (who only sees the
// roundtables they joined) sees a consistent reviewer set across cycles.
export const ROUNDTABLE_REVIEWER_EMAILS = [
	HERO_LINE_MANAGER.email,
	HERO_PROJECT_MANAGER.email,
];

// ─── The 5-cycle matrix (source of truth) ────────────────────────────────────
export const CYCLE = {
	COMPLETED_A: "Q1 2025 PR Cycle",
	COMPLETED_B: "Q3 2025 PR Cycle",
	ACTIVE: "Q3 2026 PR Cycle",
	DRAFT_READY: "Q4 2026 PR Cycle",
	DRAFT_NEEDS_PM: "Q1 2027 PR Cycle",
} as const;

export type CycleName = (typeof CYCLE)[keyof typeof CYCLE];

export interface CycleSpec {
	name: CycleName;
	status: CycleStatus;
	startDate: string;
	endDate: string;
	tenureMonths: number;
	// Stage windows (self <= peer <= roundtable <= oneOnOne, enforced at publish)
	stages: {
		self: { start: string; end: string };
		peer: { start: string; end: string };
		roundtable: { start: string; end: string };
		oneOnOne: { start: string; end: string };
	};
	hasRoundtable: boolean;
}

// COMPLETED cycles: fully finalized in the past.
// ACTIVE cycle: 2026-07-05 -> 2026-08-15, currently at the Peer Review stage.
//   Self review closes 07-15 (today is 07-17, so self is done); peer 07-15 -> 07-25,
//   roundtable 07-25 -> 07-30 (still future — HR schedules those sessions manually).
// DRAFT cycles: near-future start dates so the eligible-employee set is stable
//   and large; participants seeded from exactly getEligibleEmployees(start, 4).
export const CYCLE_SPECS: CycleSpec[] = [
	{
		name: CYCLE.COMPLETED_A,
		status: CycleStatus.COMPLETED,
		startDate: "2025-01-06T00:00:00.000Z",
		endDate: "2025-03-14T00:00:00.000Z",
		tenureMonths: 4,
		stages: {
			self: { start: "2025-01-06T00:00:00.000Z", end: "2025-01-20T00:00:00.000Z" },
			peer: { start: "2025-01-20T00:00:00.000Z", end: "2025-02-03T00:00:00.000Z" },
			roundtable: { start: "2025-02-03T00:00:00.000Z", end: "2025-02-14T00:00:00.000Z" },
			oneOnOne: { start: "2025-02-17T00:00:00.000Z", end: "2025-03-14T00:00:00.000Z" },
		},
		hasRoundtable: true,
	},
	{
		name: CYCLE.COMPLETED_B,
		status: CycleStatus.COMPLETED,
		startDate: "2025-07-07T00:00:00.000Z",
		endDate: "2025-09-12T00:00:00.000Z",
		tenureMonths: 4,
		stages: {
			self: { start: "2025-07-07T00:00:00.000Z", end: "2025-07-21T00:00:00.000Z" },
			peer: { start: "2025-07-21T00:00:00.000Z", end: "2025-08-04T00:00:00.000Z" },
			roundtable: { start: "2025-08-04T00:00:00.000Z", end: "2025-08-15T00:00:00.000Z" },
			oneOnOne: { start: "2025-08-18T00:00:00.000Z", end: "2025-09-12T00:00:00.000Z" },
		},
		hasRoundtable: true,
	},
	{
		name: CYCLE.ACTIVE,
		status: CycleStatus.ACTIVE,
		startDate: "2026-07-05T00:00:00.000Z",
		endDate: "2026-08-15T00:00:00.000Z",
		tenureMonths: 4,
		stages: {
			self: { start: "2026-07-05T00:00:00.000Z", end: "2026-07-15T00:00:00.000Z" },
			peer: { start: "2026-07-15T00:00:00.000Z", end: "2026-07-25T00:00:00.000Z" },
			roundtable: { start: "2026-07-25T00:00:00.000Z", end: "2026-07-30T00:00:00.000Z" },
			oneOnOne: { start: "2026-07-30T00:00:00.000Z", end: "2026-08-15T00:00:00.000Z" },
		},
		hasRoundtable: true,
	},
	{
		name: CYCLE.DRAFT_READY,
		status: CycleStatus.DRAFT,
		startDate: "2026-08-20T00:00:00.000Z",
		endDate: "2026-10-05T00:00:00.000Z",
		tenureMonths: 4,
		stages: {
			self: { start: "2026-08-20T00:00:00.000Z", end: "2026-09-03T00:00:00.000Z" },
			peer: { start: "2026-09-03T00:00:00.000Z", end: "2026-09-17T00:00:00.000Z" },
			roundtable: { start: "2026-09-17T00:00:00.000Z", end: "2026-09-28T00:00:00.000Z" },
			oneOnOne: { start: "2026-10-01T00:00:00.000Z", end: "2026-10-05T00:00:00.000Z" },
		},
		hasRoundtable: false,
	},
	{
		name: CYCLE.DRAFT_NEEDS_PM,
		status: CycleStatus.DRAFT,
		startDate: "2026-09-01T00:00:00.000Z",
		endDate: "2026-10-17T00:00:00.000Z",
		tenureMonths: 4,
		stages: {
			self: { start: "2026-09-01T00:00:00.000Z", end: "2026-09-15T00:00:00.000Z" },
			peer: { start: "2026-09-15T00:00:00.000Z", end: "2026-09-29T00:00:00.000Z" },
			roundtable: { start: "2026-09-29T00:00:00.000Z", end: "2026-10-10T00:00:00.000Z" },
			oneOnOne: { start: "2026-10-13T00:00:00.000Z", end: "2026-10-17T00:00:00.000Z" },
		},
		hasRoundtable: false,
	},
];

// ─── ACTIVE cycle progress targets ───────────────────────────────────────────
// Self review already closed (deadline 07-15), so everyone who was going to submit
// has — pin self at 100% so the roundtable evidence matrix is fully populated.
export const ACTIVE_SELF_REVIEW_COMPLETION = 1.0;
// Peer review is in progress: most assignments submitted, a minority still open.
export const ACTIVE_PEER_SUBMISSION_COMPLETION = 0.8;

// Each reviewee always gets exactly this many peer assignments (count is equal;
// only how many are SUBMITTED varies by cycle state).
export const PEERS_PER_REVIEWEE = 3;

/**
 * Mirrors the backend's getEligibleEmployees cut-off exactly:
 * a user is eligible for a cycle when joinedAt <= startDate - tenureMonths.
 * The seed MUST enroll participants using this same rule, or publishing a DRAFT
 * cycle throws EMPLOYEE_LIST_CHANGED.
 */
export function isEligible(
	joinedAt: Date | null,
	startDate: Date,
	tenureMonths: number,
): boolean {
	if (!joinedAt) return false;
	const cutOff = new Date(startDate);
	cutOff.setMonth(cutOff.getMonth() - tenureMonths);
	return joinedAt <= cutOff;
}
