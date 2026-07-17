#!/usr/bin/env node
/**
 * run.js — Runner script cho pr-test seed
 *
 * Chạy từ bất kỳ đâu (không cần sửa package.json hay repo chính):
 *
 *   # Từ thư mục Ehub-Atsone/seeders/pr-test/
 *   node run.js
 *
 *   # Từ bất kỳ đâu
 *   node Ehub-Atsone/seeders/pr-test/run.js
 *
 * Script tự động:
 *   1. Set NODE_PATH → dùng node_modules của ehub-nestjs-be
 *   2. Register ts-node để compile TypeScript on-the-fly
 *   3. Gọi seedPRTest() và disconnect khi xong
 */
const path = require("path");
const { execSync } = require("child_process");

// 1. Tìm đường dẫn đến ehub-nestjs-be/node_modules và thư mục backend
const beDir = path.resolve(__dirname, "../../ehub-nestjs-be");
const beNodeModules = path.resolve(beDir, "node_modules");
process.env.NODE_PATH = beNodeModules;

// 2. Chạy prisma db push --force-reset để reset database sạch trước khi seed
console.log("==========================================");
console.log("Resetting database...");
console.log("==========================================");
try {
	execSync("npx prisma db push --force-reset", {
		cwd: beDir,
		stdio: "inherit",
	});
	console.log("\nDatabase reset successfully!\n");
} catch (error) {
	console.error("Failed to reset database via prisma db push:", error.message);
	process.exit(1);
}

// 3. Re-init module paths để Node.js tìm thấy packages
require("module").Module._initPaths();

// 4. Register ts-node từ ehub-nestjs-be/node_modules
require(path.join(beNodeModules, "ts-node")).register({
	transpileOnly: true,   // Bỏ qua type-check để chạy nhanh hơn
	skipProject: true,     // Không dùng tsconfig của ehub-nestjs-be (tránh conflict)
	compilerOptions: {
		target: "ES2020",
		module: "commonjs",
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		lib: ["ES2020"],
	},
});

// 5. Load và chạy seed
const { prisma } = require("./prisma");
const { seedPRTest } = require("./index");

seedPRTest(prisma)
	.then(() => {
		console.log("\n✅ Seed hoàn thành!");
	})
	.catch((e) => {
		console.error("\n❌ Seed lỗi:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
