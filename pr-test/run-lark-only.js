const path = require("path");
const beDir = path.resolve(__dirname, "../../ehub-nestjs-be");
const beNodeModules = path.resolve(beDir, "node_modules");

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
