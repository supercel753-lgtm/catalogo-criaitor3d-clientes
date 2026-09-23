
/*
==========================================
CRIAITOR 3D
CONEXÃO SUPABASE - CLIENTES
==========================================
*/


// URL DO PROJETO

const SUPABASE_URL =

    "https://odmshtzmvtgkuxnysqor.supabase.co";


// CHAVE PÚBLICA DO PROJETO

const SUPABASE_PUBLIC_KEY =

    "sb_publishable_iGeAejP8oNb0hUy7FhThIQ_MMbzZV2c";


// CRIAR CONEXÃO

window.sb = window.supabase.createClient(

    SUPABASE_URL,

    SUPABASE_PUBLIC_KEY,

    {

        auth: {

            persistSession: false,

            autoRefreshToken: false,

            detectSessionInUrl: false

        }

    }

);
