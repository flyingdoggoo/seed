import { RoleType } from "@prisma/client";
import {
	HERO_CEO,
	HERO_CPO,
	HERO_EMPLOYEE,
	HERO_HR_ADMIN,
	HERO_LINE_MANAGER,
	HERO_PROJECT_MANAGER,
	type ShowcaseAccount,
} from "../showcase-data";

/**
 * Real Lark accounts from the HRIS export (source of truth for identities).
 *
 * email      = @ehub.enosta.com login alias (User.email, unique)
 * larkEmail  = the contact address Lark resolves the person by (stored on
 *              LarkAccountLink.email; may equal email when business == work email)
 * joinedAt   = real start date where the export gives one; a safe early default
 *              (2023-01-01) where it is blank, so the person stays cycle-eligible.
 *
 * The heroes are defined in showcase-data.ts and re-exported here so the whole
 * fixed-identity set is seeded from one list.
 */

export const REAL_LARK_ACCOUNTS: ShowcaseAccount[] = [
	// Heroes first (authoritative).
	HERO_CEO,
	HERO_CPO,
	HERO_LINE_MANAGER,
	HERO_PROJECT_MANAGER,
	HERO_EMPLOYEE,
	HERO_HR_ADMIN,

	// Other real Lark accounts from the export.
	{
		fullName: "Tai Vo",
		jobTitle: "Engineering Manager",
		email: "tai.vo@ehub.enosta.com",
		larkEmail: "tai.vo@team.enosta.com",
		employeeCode: "EHUB-R-0001",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.LINE_MANAGER,
		departmentCode: "PDO",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Linh Manager",
		jobTitle: "Frontend Chapter Lead",
		email: "dklinh05@ehub.enosta.com",
		larkEmail: "dklinh05@gmail.com",
		employeeCode: "EHUB-R-0002",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.FUNCTION_LEAD,
		departmentCode: "FE",
		lineManagerEmail: HERO_CPO.email,
	},
	{
		fullName: "Kien Nguyen Enos",
		jobTitle: "Human Resource Manager",
		email: "kien.nguyen123@ehub.enosta.com",
		larkEmail: "kien.nguyen@team.enosta.com",
		employeeCode: "EHUB-R-0003",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.LINE_MANAGER,
		departmentCode: "HRO",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "nguyen nguyen",
		jobTitle: "Human Resource Manager",
		email: "hoangnguyendepgiai@ehub.enosta.com",
		larkEmail: "hoangnguyendepgiai@gmail.com",
		employeeCode: "EHUB-R-0004",
		joinedAt: "2026-06-22T00:00:00.000Z",
		role: RoleType.LINE_MANAGER,
		departmentCode: "HRO",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Le Ky Ba",
		jobTitle: "Human Resource Manager",
		email: "lekyba2000hc@ehub.enosta.com",
		larkEmail: "lekyba2000hc@gmail.com",
		employeeCode: "EHUB-R-0005",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.LINE_MANAGER,
		departmentCode: "HRO",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Hiếu HR",
		jobTitle: "Human Resource Manager",
		email: "thanhhieu.nguyen@ehub.enosta.com",
		larkEmail: "thanhhieu.nguyen@team.enosta.com",
		employeeCode: "EHUB-R-0006",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.LINE_MANAGER,
		departmentCode: "HRO",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Hiếu Nhân Viên",
		jobTitle: "Engineering Manager",
		email: "hieunhanvien@ehub.enosta.com",
		larkEmail: "itadadenhat@gmail.com",
		employeeCode: "EHUB-R-0026",
		joinedAt: "2026-06-24T00:00:00.000Z",
		role: RoleType.EMPLOYEE,
		departmentCode: "BE",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Tai Vo PM",
		jobTitle: "Project Manager",
		email: "ductai.vo@ehub.enosta.com",
		larkEmail: "voductaitxqt123@gmail.com",
		employeeCode: "EHUB-R-0008",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.PROJECT_MANAGER,
		departmentCode: "FE",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "adam trần",
		jobTitle: "Frontend Engineer",
		email: "xoenggame1@ehub.enosta.com",
		larkEmail: "xoenggame1@gmail.com",
		employeeCode: "EHUB-R-0009",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.EMPLOYEE,
		departmentCode: "FE",
		lineManagerEmail: "hoangnguyendepgiai@ehub.enosta.com",
	},
	{
		fullName: "Tran Hoang Xuan Ba",
		jobTitle: "Backend Engineer",
		email: "pnv.familier@ehub.enosta.com",
		larkEmail: "pnv.familier@gmail.com",
		employeeCode: "EHUB-R-0010",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.EMPLOYEE,
		departmentCode: "FE",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Vo Duc Ba",
		jobTitle: "Human Resource Manager",
		email: "ba.le26@ehub.enosta.com",
		larkEmail: "ba.le26@student.passerellesnumeriques.org",
		employeeCode: "EHUB-R-0011",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.EMPLOYEE,
		departmentCode: "FE",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Hiếu Manager",
		jobTitle: "Engineering Manager",
		email: "nguyenthanhhieu17022005@ehub.enosta.com",
		larkEmail: "nguyenthanhhieu17022005@ehub.enosta.com",
		employeeCode: "EHUB-R-0012",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.LINE_MANAGER,
		departmentCode: "FE",
		lineManagerEmail: HERO_CEO.email,
	},
	{
		fullName: "Linh Do",
		jobTitle: "Frontend Engineer",
		email: "linh.do@ehub.enosta.com",
		larkEmail: "linh.do@ehub.enosta.com",
		employeeCode: "EHUB-R-0013",
		joinedAt: "2026-06-01T00:00:00.000Z",
		role: RoleType.EMPLOYEE,
		departmentCode: "FE",
		lineManagerEmail: "tai.vo@ehub.enosta.com",
	},
	{
		fullName: "Ba Le",
		jobTitle: "Backend Chapter Lead",
		email: "ba.le@ehub.enosta.com",
		larkEmail: "ba.le@team.enosta.com",
		employeeCode: "EHUB-R-0014",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.FUNCTION_LEAD,
		departmentCode: "BE",
		lineManagerEmail: HERO_CPO.email,
	},
	{
		fullName: "Kien Nguyen",
		jobTitle: "Frontend Chapter Lead",
		email: "kien.nguyen@ehub.enosta.com",
		larkEmail: "kien56162@gmail.com",
		employeeCode: "EHUB-R-0015",
		joinedAt: "2023-01-01T00:00:00.000Z",
		role: RoleType.FUNCTION_LEAD,
		departmentCode: "FE",
		lineManagerEmail: HERO_CEO.email,
	},
];

// email (login) -> larkEmail (Lark contact) for accounts where they differ.
// Used by the calendar seeder to resolve Lark IDs by the address Lark knows.
export const larkEmailByLogin: Record<string, string> = Object.fromEntries(
	REAL_LARK_ACCOUNTS.map((a) => [a.email, a.larkEmail]),
);
