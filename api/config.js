// Public configuration the page needs at load. The Supabase anon key is designed to be public;
// row-level security in the database is what protects data, not secrecy of this key.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    search: process.env.LINKUP_API_KEY ? "linkup" : process.env.TAVILY_API_KEY ? "tavily" : null,
  });
}
