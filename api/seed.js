require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seed() {
  try {
    const filePath = path.resolve(__dirname, '..', 'projects.json');
    console.log('Reading from:', filePath);
    const projects = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('Found ' + projects.length + ' projects in projects.json.');
    
    // Clear existing projects to ensure a clean sync
    console.log('Clearing existing projects from Supabase...');
    const { error: clearError } = await supabase.from('projects').delete().neq('id', 0);
    if (clearError) {
       console.error('Error clearing projects:', clearError.message);
    }

    console.log('Uploading new projects...');
    // Removing imageUrl if it doesn't exist in Supabase table
    const cleanedProjects = projects.map(({ secret, imageUrl, ...p }) => p);
    
    const { data, error } = await supabase.from('projects').insert(cleanedProjects);
    
    if (error) {
      console.error('Error seeding projects:', error.message);
    } else {
      console.log('Successfully seeded projects to Supabase!');
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

seed();
