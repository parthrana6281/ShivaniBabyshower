# Shivani Baby Shower Final Site

## Flow

Guest name -> animated envelope -> personalized invitation -> RSVP modal -> YES/NO for every person in their family -> Submit -> Supabase database.

Host dashboard: `admin.html`

## Current event

- Honoring: Shivani Rana
- Sunday, February 7, 2027
- 2:30 PM - 5:50 PM
- Location: coming soon
- Gender: intentionally not disclosed

## Configure

Edit `config.js`:
- `supabaseUrl`
- `supabaseAnonKey`
- `locationName`
- `locationAddress`
- `babylistUrl`
- `families`

## Supabase

Run `supabase-schema.sql` in Supabase SQL Editor.

For the public RSVP form, the anon key is okay to use in a static website, but the database policies must be reviewed carefully. The admin dashboard should be protected with Supabase Auth before it is publicly shared.

## GitHub Pages

Upload these files to the repository root and enable GitHub Pages from the `main` branch and root folder.

## Important

The guest list in `config.js` is public JavaScript once deployed. For stronger privacy, move guest verification to a Supabase Edge Function or another server-side endpoint before final public launch.
