import { EmploymentStatus, PrismaClient, RoleType } from "@prisma/client";
import { DemoConfig } from "../../config";
import { userData } from "./users-data";
import { emailMappings, nameMappings } from "./user-mapping";
import { pendingEmployeesData } from "./additional-users";

interface LarkTokenResponse {
	tenant_access_token?: string;
	code?: number;
	msg?: string;
}

interface LarkUserItem {
	email: string;
	user_id?: string;
}

interface LarkBatchIdResponse {
	code: number;
	msg: string;
	data?: {
		user_list?: LarkUserItem[];
	};
}

export async function seedUsers(prisma: PrismaClient) {
	console.log("Seeding Users...");

	// Add pendingEmployeesData to userData so they are processed uniformly
	const uniquePendingData = Array.from(
		new Map(pendingEmployeesData.map((item) => [item.fullName, item])).values(),
	);

	for (const item of uniquePendingData) {
		// Only add if not already in userData (avoid duplicates)
		if (userData.some((u) => u.fullName === item.fullName)) continue;

		const cleanName = item.fullName.split("(")[0].trim();
		const emailName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
		
		// Find department code, e.g. "Nhat Huynh (EHUB - BE)" -> "EHUB"
		const match = item.fullName.match(/\(([^)]+)\)/);
		let deptCode = "EHUB";
		if (match) {
			deptCode = match[1].split("-")[0].trim();
			if (deptCode === "ES") {
				deptCode = "ESP";
			}
		}
		
		const email = `${emailName}.${deptCode.toLowerCase()}@team.ehub.com`;
		const empCode = `EMP-R-${Math.floor(10000 + Math.random() * 90000)}`;

		userData.push({
			fullName: item.fullName,
			jobTitle: item.jobTitle,
			employeeCode: empCode,
			email,
			lineManager: DemoConfig.LINE_MANAGER.FULLNAME,
			joinedAt: "2023-01-01T00:00:00.000Z",
			role: RoleType.EMPLOYEE as any,
		});
	}

	// Apply mappings to userData in-place
	for (const u of userData) {
		const mappedEmail = emailMappings[u.email];
		if (mappedEmail) {
			u.email = mappedEmail;
		}
		const mappedName = nameMappings[u.fullName];
		if (mappedName) {
			u.fullName = mappedName;
		}
		if (u.lineManager) {
			const mappedManagerName = nameMappings[u.lineManager];
			if (mappedManagerName) {
				u.lineManager = mappedManagerName;
			}
		}
	}

	const departments = await prisma.department.findMany({});

	for (const u of userData) {
		const match = u.fullName.match(/\(([^)]+)\)/);
		let deptId: string | null = null;
		if (match) {
			const deptCode = match[1].split("-")[0].trim();
			let dbDept = departments.find((d) => d.code === deptCode);
			if (!dbDept && deptCode === "ES") {
				dbDept = departments.find((d) => d.code === "ESP" || d.code === "SP");
			}
			if (dbDept) {
				deptId = dbDept.id;
			}
		}

		await prisma.user.upsert({
			where: { email: u.email },
			update: {
				fullName: u.fullName,
				employeeCode: u.employeeCode || null,
				jobTitle: u.jobTitle || null,
				status: EmploymentStatus.ACTIVE,
				joinedAt: u.joinedAt ? new Date(u.joinedAt) : null,
				departmentId: deptId,
			},
			create: {
				email: u.email,
				employeeCode: u.employeeCode || null,
				fullName: u.fullName,
				jobTitle: u.jobTitle || null,
				status: EmploymentStatus.ACTIVE,
				joinedAt: u.joinedAt ? new Date(u.joinedAt) : null,
				departmentId: deptId,
			},
		});
	}
	console.log("Seeded Users.");

	// Resolve Lark Open IDs and seed LarkAccountLink
	const realEmails = [
		...Object.values(emailMappings),
		DemoConfig.HR_ADMIN.EMAIL,
		DemoConfig.LINE_MANAGER.EMAIL,
	];

	try {
		console.log("Resolving Lark Open IDs for real accounts...");
		const appId = process.env.LARK_APP_ID || "cli_aab91998c3b8de18";
		const appSecret =
			process.env.LARK_APP_SECRET || "ww8817EcUDavmdPIv02yoHkQy8MDlZSo";

		const tokenRes = await fetch(
			"https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
			},
		);
		const tokenData = (await tokenRes.json()) as LarkTokenResponse;
		const tenantAccessToken = tokenData.tenant_access_token;

		if (tenantAccessToken) {
			const res = await fetch(
				"https://open.larksuite.com/open-apis/contact/v3/users/batch_get_id?user_id_type=open_id",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${tenantAccessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ emails: realEmails }),
				},
			);
			const data = (await res.json()) as LarkBatchIdResponse;
			if (data.code === 0 && data.data && data.data.user_list) {
				console.log("Seeding Lark Account Links...");
				for (const item of data.data.user_list) {
					if (!item.user_id) {
						console.log(`Could not resolve Open ID for ${item.email}`);
						continue;
					}
					const dbUser = await prisma.user.findUnique({
						where: { email: item.email },
					});
					if (dbUser) {
						let avatarUrl: string | null = null;
						let jobTitle: string | null = null;

						try {
							const profileRes = await fetch(
								`https://open.larksuite.com/open-apis/contact/v3/users/${item.user_id}?user_id_type=open_id`,
								{
									headers: {
										Authorization: `Bearer ${tenantAccessToken}`,
									},
								},
							);
							const profileData = (await profileRes.json()) as any;
							if (profileData.code === 0 && profileData.data?.user) {
								const u = profileData.data.user;
								avatarUrl =
									u.avatar?.avatar_640 ||
									u.avatar?.avatar_240 ||
									u.avatar?.avatar_72 ||
									null;
								jobTitle = u.job_title || null;
							}
						} catch (profileErr) {
							console.warn(
								`Failed to fetch profile details for ${item.email}:`,
								profileErr,
							);
						}

						await prisma.user.update({
							where: { id: dbUser.id },
							data: {
								avatarUrl,
								jobTitle,
							},
						});

						await prisma.larkAccountLink.upsert({
							where: { userId: dbUser.id },
							update: {
								larkUserId: item.user_id,
								status: "LINKED",
							},
							create: {
								userId: dbUser.id,
								larkUserId: item.user_id,
								email: item.email,
								status: "LINKED",
							},
						});
						console.log(`Linked ${item.email} to Lark ID ${item.user_id} (avatarUrl: ${avatarUrl})`);
					}
				}
			} else {
				console.error("Failed to batch retrieve Lark IDs:", data.msg);
			}
		} else {
			console.error(
				"Failed to get tenant access token for seeding Lark links.",
			);
		}
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : "Unknown error";
		console.warn("Lark Open ID seeding skipped/failed:", errorMessage);
	}
}

