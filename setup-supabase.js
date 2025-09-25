#!/usr/bin/env node

/**
 * Supabase Setup Helper Script
 * This script helps you set up Supabase integration for your SpareSmart app
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 SpareSmart Supabase Setup Helper\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupSupabase() {
  try {
    console.log('This script will help you configure Supabase for your SpareSmart app.\n');
    
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);
    
    if (envExists) {
      console.log('✅ .env.local file already exists');
      const overwrite = await askQuestion('Do you want to update it? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }
    
    console.log('\n📋 Please provide your Supabase credentials:');
    console.log('You can find these in your Supabase dashboard under Settings > API\n');
    
    const supabaseUrl = await askQuestion('Enter your Supabase URL (e.g., https://your-project.supabase.co): ');
    const supabaseKey = await askQuestion('Enter your Supabase anon key: ');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Both URL and key are required. Setup cancelled.');
      rl.close();
      return;
    }
    
    // Create .env.local file
    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully');
    
    // Update config file as backup
    const configPath = path.join(process.cwd(), 'src', 'config', 'supabase.js');
    const configContent = `// Supabase Configuration
// Replace these with your actual Supabase project credentials
export const SUPABASE_CONFIG = {
  url: '${supabaseUrl}',
  anonKey: '${supabaseKey}'
}

// Instructions for setup:
// 1. Go to https://supabase.com and create a new project
// 2. Go to Settings > API in your Supabase dashboard
// 3. Copy the Project URL and anon/public key
// 4. Replace the values above with your actual credentials
// 5. For production, use environment variables instead
`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Config file updated as backup');
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the database schema in your Supabase SQL editor');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Check the browser console for any connection errors');
    console.log('\n📚 For detailed instructions, see SUPABASE_SETUP.md');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupSupabase();
