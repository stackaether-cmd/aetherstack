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
    console.log('Found ' + projects.length + ' projects in projects.json. Uploading...');
    
    // Removing imageUrl if it doesn't exist in Supabase table
    const cleanedProjects = projects.map(({ secret, imageUrl, ...p }) => p);
    
    const { data, error } = await supabase.from('projects').upsert(cleanedProjects, { onConflict: 'id' });
    
    if (error) {
      console.error('Error seeding projects:', error.message);
      console.log('Attempting without explicit IDs...');
      const noIdProjects = cleanedProjects.map(({ id, ...p }) => p);
      const { error: error2 } = await supabase.from('projects').insert(noIdProjects);
      if (error2) console.error('Secondary error:', error2.message);
      else console.log('Successfully inserted projects (new IDs generated)!');
    } else {
      console.log('Successfully seeded projects to Supabase!');
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

seed();
