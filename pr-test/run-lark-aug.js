const path = require("path");
const fs = require("fs");

const findBackendDir = () => {
	if (process.env.EHUB_BE_DIR) {
		return path.resolve(process.env.EHUB_BE_DIR);
	}
	const candidates = [
		path.resolve(__dirname, "../../Ehub-Atsone/ehub-nestjs-be"),
		path.resolve(__dirname, "../../official_backend/ehub-nestjs-be"),
		path.resolve(__dirname, "../../ehub-nestjs-be"),
	];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "package.json"))) {
			return candidate;
		}
	}
	return candidates[1]; // fallback
};

const beDir = findBackendDir();
process.env.EHUB_BE_DIR = beDir;
const beNodeModules = path.resolve(beDir, "node_modules");

// Intercept require to remap official_backend paths → actual BE dir
const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
	if (typeof request === "string" && request.includes("official_backend/ehub-nestjs-be")) {
		const targetDir = process.env.EHUB_BE_DIR
			? path.resolve(process.env.EHUB_BE_DIR)
			: path.resolve(__dirname, "../../official_backend/ehub-nestjs-be");
		const absoluteRequest = path.resolve(path.dirname(this.filename), request);
		const defaultBeDir = path.resolve(__dirname, "../../official_backend/ehub-nestjs-be");
		if (absoluteRequest.startsWith(defaultBeDir)) {
			const relativePart = path.relative(defaultBeDir, absoluteRequest);
			const newPath = path.resolve(targetDir, relativePart);
			return originalRequire.call(this, newPath);
		}
	}
	return originalRequire.call(this, request);
};

process.env.NODE_PATH = beNodeModules;
require("module").Module._initPaths();

// Load environment variables from ehub-nestjs-be/.env
require(path.join(beNodeModules, "dotenv")).config({
	path: path.join(beDir, ".env"),
});

// Register ts-node for TypeScript compilation
require(path.join(beNodeModules, "ts-node")).register({
	transpileOnly: true,
	skipProject: true,
	compilerOptions: {
		target: "ES2020",
		module: "commonjs",
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		lib: ["ES2020"],
	},
});

// Set up Prisma with pg adapter (same pattern as run-lark-only.js)
const { Pool } = require(path.join(beNodeModules, "pg"));
const { PrismaPg } = require(path.join(beNodeModules, "@prisma/adapter-pg"));
const { PrismaClient } = require(path.join(beNodeModules, "@prisma/client"));
const { seedLarkCalendarEventsAug } = require("./modules/users/seed-lark-events-aug");

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

seedLarkCalendarEventsAug(prisma)
	.then(() => {
		console.log("\n✅ Calendar seed (Jul 31 – Aug 10) hoàn thành!");
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
