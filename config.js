/*
  SITE SETTINGS
  Replace only the values marked TODO.
  SUPABASE_URL and SUPABASE_ANON_KEY come from your Supabase project.
*/

const SITE_CONFIG = {
  supabaseUrl: "https://cnvulxfsoquifpnqfrng.supabase.co",
  supabaseAnonKey: "sb_publishable_W2Q5cpJx3kgTWz9fuAaRQQ_UXLo5uEd",

  // TODO: add your final venue when confirmed
  locationName: "Location coming soon",
  locationAddress: "Details will be added shortly",

  // TODO: paste your Babylist registry URL when ready
  babylistUrl: "",

  // RSVP families. Add/edit families as your guest list grows.
  families: [
    {
      id: "parth-rana",
      displayName: "Parth Rana Family",
      guests: ["Parth Rana", "Shivani Rana", "Bruno"]
    }
    {
      id: "chirag-rana-family",
      displayName: "Chirag Rana Family",
      guests: ["Chirag Rana", "Chandni Kinkhabwala", "Aarav Rana", "Ishani Rana"]
    }
  
  ]
};
