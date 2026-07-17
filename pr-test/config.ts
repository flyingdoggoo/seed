import * as dotenv from "dotenv";
import * as path from "path";

// Load .env từ ehub-nestjs-be (chạy từ bất kỳ CWD nào)
dotenv.config({ path: path.resolve(__dirname, "../../ehub-nestjs-be/.env") });

export const DemoConfig = {
	HR_ADMIN: {
		FULLNAME: process.env.HR_ADMIN_FULLNAME || "HR Admin",
		JOB_TITLE: process.env.HR_ADMIN_JOB_TITLE || "HR Administrator",
		EMAIL: process.env.HR_ADMIN_EMAIL_ADDRESS || "hr@ehub.enosta.com",
	},
	LINE_MANAGER: {
		FULLNAME:
			process.env.LINE_MANAGER_FULLNAME || "Long Nguyen (EHUB - PDO)",
		JOB_TITLE:
			process.env.LINE_MANAGER_JOB_TITLE || "Engineering Manager",
		EMAIL:
			process.env.LINE_MANAGER_EMAIL_ADDRESS ||
			"nguyenthanhhieu17022005@ehub.enosta.com",
	},
	PROJECT_MANAGER: {
		FULLNAME:
			process.env.PROJECT_MANAGER_FULLNAME || "An Nguyen (EHUB - PM)",
		JOB_TITLE:
			process.env.PROJECT_MANAGER_JOB_TITLE || "Project Manager",
		EMAIL:
			process.env.PROJECT_MANAGER_EMAIL_ADDRESS || "ray.nguyen@ehub.com",
	},
};
