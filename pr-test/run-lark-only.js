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
	return candidates[1]; // fallback to default
};
const beDir = findBackendDir();
process.env.EHUB_BE_DIR = beDir;
const beNodeModules = path.resolve(beDir, "node_modules");

// Intercept require calls to map imports from the default path to the actual backend path if different
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

// Load environment variables
require(path.join(beNodeModules, "dotenv")).config({
	path: path.join(beDir, ".env")
});

// Register ts-node
require(path.join(beNodeModules, "ts-node")).register({
	transpileOnly: true,
	skipProject: true,
	compilerOptions: {
		target: "ES2020",
		module: "commonjs",
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		lib: ["ES2020"]
	}
});

// Import pg Pool and Prisma adapter
const { Pool } = require(path.join(beNodeModules, "pg"));
const { PrismaPg } = require(path.join(beNodeModules, "@prisma/adapter-pg"));
const { PrismaClient } = require(path.join(beNodeModules, "@prisma/client"));
const { seedLarkCalendarEvents } = require("./modules/users/seed-lark-events");

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

seedLarkCalendarEvents(prisma)
	.then(() => {
		console.log("Done");
	})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
