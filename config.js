/*
  SITE SETTINGS
  Replace only the values marked TODO.
  SUPABASE_URL and SUPABASE_ANON_KEY come from your Supabase project.
*/

const SITE_CONFIG = {
  supabaseUrl: "TODO_SUPABASE_URL",
  supabaseAnonKey: "TODO_SUPABASE_ANON_KEY",

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
  ]
};
