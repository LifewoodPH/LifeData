const { createClient } = require('@supabase/supabase-js');

// These would normally be in .env but I'll use the environment variables directly if available
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
    console.log('Listing root...');
    const { data: root, error: rootErr } = await supabase.storage.from('Data').list('');
    if (rootErr) console.error(rootErr);
    console.log('Root items:', JSON.stringify(root, null, 2));

    if (root) {
        for (const item of root) {
            if (!item.id) {
                console.log(`Listing folder: ${item.name}...`);
                const { data: sub, error: subErr } = await supabase.storage.from('Data').list(item.name);
                if (subErr) console.error(subErr);
                console.log(`Contents of ${item.name}:`, JSON.stringify(sub, null, 2));
            }
        }
    }
}

listAll();
