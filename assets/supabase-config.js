/*
 * AnumBrix Supabase client configuration.
 * This is the public/publishable browser key. Never put a Supabase secret key here.
 */
(function () {
    const SUPABASE_URL = "https://clidhgxxzimqumlufgme.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9H4lhczNSl7Z1t2Pv6h8uA_26MRWfHw";

    if (!window.supabase || !window.supabase.createClient) {
        console.error("AnumBrix: Supabase client library did not load.");
        return;
    }

    window.anumBrixSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
})();
