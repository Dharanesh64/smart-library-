import { createClient } from 'npm:@supabase/supabase-js@2';
import * as bcrypt from 'npm:bcryptjs@2.4.3';
import * as jwt from 'npm:jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AuthRequest {
  action: 'phone_login' | 'setup_account' | 'login' | 'verify_otp' | 'reset_password';
  phone_number?: string;
  username?: string;
  password?: string;
  name?: string;
  otp_code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, phone_number, username, password, name, otp_code }: AuthRequest = await req.json();

    switch (action) {
      case 'phone_login': {
        if (!phone_number) {
          return new Response(
            JSON.stringify({ error: 'Phone number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if admin exists with this phone number
        const { data: admin, error } = await supabase
          .from('admins')
          .select('*')
          .eq('phone_number', phone_number)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (!admin) {
          return new Response(
            JSON.stringify({ error: 'Phone number not authorized for admin access' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!admin.is_setup_complete) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              requires_setup: true,
              admin_id: admin.id 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            requires_setup: false,
            admin_id: admin.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'setup_account': {
        if (!phone_number || !username || !password || !name) {
          return new Response(
            JSON.stringify({ error: 'All fields are required for account setup' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: admin, error } = await supabase
          .from('admins')
          .update({
            username,
            password_hash: hashedPassword,
            name,
            is_setup_complete: true
          })
          .eq('phone_number', phone_number)
          .select()
          .single();

        if (error) {
          throw error;
        }

        const token = jwt.sign(
          { admin_id: admin.id, username: admin.username },
          Deno.env.get('JWT_SECRET') ?? 'fallback_secret',
          { expiresIn: '24h' }
        );

        return new Response(
          JSON.stringify({ 
            success: true, 
            token,
            admin: {
              id: admin.id,
              username: admin.username,
              name: admin.name,
              phone_number: admin.phone_number
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'login': {
        if (!username || !password) {
          return new Response(
            JSON.stringify({ error: 'Username and password are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: admin, error } = await supabase
          .from('admins')
          .select('*')
          .eq('username', username)
          .eq('is_active', true)
          .eq('is_setup_complete', true)
          .single();

        if (error || !admin) {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        if (!isValidPassword) {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const token = jwt.sign(
          { admin_id: admin.id, username: admin.username },
          Deno.env.get('JWT_SECRET') ?? 'fallback_secret',
          { expiresIn: '24h' }
        );

        return new Response(
          JSON.stringify({ 
            success: true, 
            token,
            admin: {
              id: admin.id,
              username: admin.username,
              name: admin.name,
              phone_number: admin.phone_number
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});