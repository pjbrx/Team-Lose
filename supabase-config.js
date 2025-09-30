// supabase-config.js
const SUPABASE_URL = "https://vjujsuucmgkbetembcki.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdWpzdXVjbWdrYmV0ZW1iY2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjQ2MTgsImV4cCI6MjA3NDgwMDYxOH0.30rN-5xJGU79oqsY5vKU6BRU-xFRn8x3gII9tT4c7Mc";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// fonction pour récupérer l'utilisateur courant
function getUser() {
  return supabase.auth.user(); // retourne null si pas connecté
}
