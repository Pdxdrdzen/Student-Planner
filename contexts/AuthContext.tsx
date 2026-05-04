// contexts/AuthContext.tsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';
import {Session} from "@supabase/supabase-js";
import * as Linking from 'expo-linking';

type User = {
    id:string;
    name: string;
    email: string;
} | null;

type AuthContextType = {
    user: User;
    session: Session | null;
    login: (email: string, password: string) => Promise<{error:string|null}>;
    register: (email: string, password: string, name: string, university?:string) => Promise<{error:string|null}>;
    logout: () => Promise<void>;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    //States for user(user data), session(supabase token), loading(checks if user is logged in or not)
    const [user, setUser] = useState<User>(null);
    const [session, setSession] = useState<Session|null>(null);
    const [loading, setLoading] = useState(true);
    const sessionTimeout=setTimeout(() => {
        setLoading(false);
    },5000);

    //useEffect - hook that compiles the code under when the hook is shown up on screen
    useEffect(() => {
        //check if session from last startup is active(asyncstorage should remember)
        supabase.auth.getSession().then(({data:{session}})=>{
            clearTimeout(sessionTimeout);
            setSession(session);
            if(session?.user){
                fetchProfile(session.user.id);
            }else{
                setLoading(false);
            }

        });
        //Real-time Listener for authorization state changes
        const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
            setSession(session);
            if(session?.user){
                fetchProfile(session.user.id);
            }else{
                setUser(null);
                setLoading(false);
            }
        });
        const handleDeepLink=async(url:string)=>{
            const parsed=Linking.parse(url);
            if(parsed.path==='email-confirmed'||parsed.path==='reset-password'){
                const {data}=await supabase.auth.getSession();
                if(data.session){
                    setSession(data.session);
                    fetchProfile(data.session.user.id);
                }
            }
        };
        Linking.getInitialURL().then((url)=>{
            if(url) handleDeepLink(url);
        });

        const linkingSub=Linking.addEventListener('url',({url})=>
            handleDeepLink(url)
        );
        //Component cleanup to avoid data leaks
        return () => subscription.unsubscribe();
        linkingSub.remove();
    }, []);//empty dependency table - makes the hook start once, not with every re-render

    //JS SQL query for downloading user data from the database
    const fetchProfile = async (userId: string) => {
        try {
            const {data:sessionData} = await supabase.auth.getSession();
            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            console.log('fetchprofile data:', JSON.stringify(data));
            console.log('fetchprofile error: ', JSON.stringify(error));
            if (data && !error) {
                setUser({id: data.id, name: data.name, email: sessionData.session?.user?.email ?? ''});
            } else {
                setUser(null);
                await supabase.auth.signOut();
            }
        }catch(e){
            console.log('fetchprofile catch: ',JSON.stringify(e));
            setUser(null);
        }finally{
            setLoading(false);

        }

    };
    //Single login/register functions for context to avoid repeated usage of signInWithPassword within login/register screens
    const login = async (email: string, password: string) => {
        console.log('login called with email: ',JSON.stringify(email));
        console.log('and password:', JSON.stringify(password));

        //temp hardcoded login credentials
        /*
        const testEmail='varenikgaming@gmail.com'
        const testPassword='Lol123345.'

         */
        try {
            const {data, error} = await supabase.auth.signInWithPassword({email, password});
            console.log('signinwithpassword answered with error: ',error?.message);
            /*
            console.log('hardcode test - error:', JSON.stringify(error));
            console.log('hardcode test - user:', data?.user?.email);
            */

            if(error) {
                return {error: error.message};
            }
            return {error: null};
        }catch(e){
            console.log('catch error: ', e);
            return{error: 'Brak polaczenia z internetem'};
        }
    };
    const register=async (email: string, password: string,name:string,university?:string) => {
        console.log('register tryout: : ', JSON.stringify({email,password}));
        const {data, error} = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
          // options: {data:{name}},
        })
        console.log('data: ',JSON.stringify(data));
        console.log('Supabase error:', JSON.stringify(error));
        if(error) return {error: error.message};

        if(data.user&&university){
            await supabase.from('profiles').update({university}).eq('id', data.user.id);

        }return {error: null};
    };
    const logout = async () => {
        await supabase.auth.signOut();
    };

    //Data export, object value shared for every component inside the provider
    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                login,
                register,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);