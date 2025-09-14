import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ztlwwfaovexlqegkymyx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bHd3ZmFvdmV4bHFlZ2t5bXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mjc0OTcsImV4cCI6MjA3MzQwMzQ5N30.YB7x-3xtpnpgoGIp01LPbbIcXdKkXwSuBS_DsJABr3o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
