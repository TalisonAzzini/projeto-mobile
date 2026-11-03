import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://juxqoryqcvblsyryvzhr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_U5YhqNTbx-HGLcd9X4KSBw_O2wvMLlp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);