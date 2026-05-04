import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jflikkaehoflxaagblxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbGlra2FlaG9mbHhhYWdibHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODAzMTUsImV4cCI6MjA5MzM1NjMxNX0.fbvOxxhfA9W73hbV-B0lFaOiIXv8haBhReCGiS99FSk';

export const supabase=createClient(SUPABASE_URL, SUPABASE_ANON_KEY,{
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },

});
supabase.from('profiles').select('count').then(({data,error}) => {
    if(error) {
        console.log('error supabase: ',error.message);
    }else{
        console.log('Supabase connection succesful');
    }
})