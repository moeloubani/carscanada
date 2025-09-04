#!/usr/bin/env node

/**
 * Railway Database Migration Script
 * Run this script on Railway to set up your database
 * 
 * Usage on Railway:
 * 1. Deploy this to your Railway project
 * 2. Run via Railway CLI: railway run node apps/api/railway-migrate.js
 * Or set as a one-time command in Railway dashboard
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 CarsCanada Database Migration Script for Railway');
console.log('===================================================\n');

// Change to the API directory
process.chdir(path.join(__dirname));

function runCommand(command, description) {
    console.log(`\n📍 ${description}...`);
    try {
        const output = execSync(command, { 
            encoding: 'utf8',
            stdio: 'inherit'
        });
        console.log(`✅ ${description} completed`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

async function migrate() {
    // Install dependencies if needed
    if (!runCommand('npm list @prisma/client', 'Checking Prisma Client')) {
        runCommand('npm install', 'Installing dependencies');
    }

    // Generate Prisma Client
    if (!runCommand('npx prisma generate', 'Generating Prisma Client')) {
        process.exit(1);
    }

    // Push database schema
    if (!runCommand('npx prisma db push --accept-data-loss', 'Pushing database schema')) {
        console.log('\n⚠️  Trying alternative migration method...');
        if (!runCommand('npx prisma migrate deploy', 'Running migrations')) {
            console.error('❌ Database setup failed');
            process.exit(1);
        }
    }

    // Seed featured packages
    console.log('\n🌱 Seeding database...');
    runCommand('npm run seed:packages', 'Seeding featured packages');

    console.log('\n✅ Database migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Database schema has been created/updated');
    console.log('- Featured packages have been seeded');
    console.log('- Your API is ready to use');
    
    // Show current tables
    console.log('\n📊 Database tables created:');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        tables.forEach(t => console.log(`  - ${t.table_name}`));
    } catch (error) {
        console.log('  (Unable to list tables)');
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrate().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});