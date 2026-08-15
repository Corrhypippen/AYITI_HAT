'use strict';

const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

/**
 * Supabase client initialized with the service-role key.
 * The service-role key bypasses Row Level Security and should
 * NEVER be exposed to the browser. Server use only.
 */
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;
