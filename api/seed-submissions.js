require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seed() {
  try {
    const filePath = path.resolve(__dirname, '..', 'submissions.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Mapping back to original camelCase but keeping only likely columns
    const submissions = raw.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      budget: s.budget,
      message: s.message
    }));

    console.log('Attempting upload with basic columns (name, email, budget, message)...');
    const { data, error } = await supabase.from('submissions').upsert(submissions, { onConflict: 'id' });
    
    if (error) {
      console.error('Error seeding submissions:', error.message);
    } else {
      console.log('Successfully seeded submissions to Supabase!');
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

seed();
