const { PrismaClient } = require('@prisma/client');
const { seedLarkCalendarEvents } = require('./modules/users/seed-lark-events');
const prisma = new PrismaClient();
seedLarkCalendarEvents(prisma)
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
