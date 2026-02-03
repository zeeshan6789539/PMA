#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Express Backend Setup Script');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please edit the .env file with your database credentials before continuing.\n');
  } else {
    console.log('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed.\n');
}

// Check if Prisma client is generated
const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma');
if (!fs.existsSync(prismaClientPath)) {
  console.log('🔧 Generating Prisma client...');
  try {
    execSync('npm run db:generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully!\n');
  } catch (error) {
    console.log('❌ Failed to generate Prisma client:', error.message);
    console.log('⚠️  Make sure your database is running and DATABASE_URL is correct in .env file.\n');
  }
} else {
  console.log('✅ Prisma client already generated.\n');
}

console.log('🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your database credentials');
console.log('2. Run: npm run db:migrate');
console.log('3. Run: npm run db:seed');
console.log('4. Run: npm run dev');
console.log('\nFor more information, check the README.md file.'); 