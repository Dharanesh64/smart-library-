import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface NotificationRequest {
  action: 'send_due_reminders' | 'send_availability_alerts' | 'send_otp' | 'send_overdue_notices';
  phone_number?: string;
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

    if (req.method === 'GET') {
      // Get notification history
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ notifications }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, phone_number, otp_code }: NotificationRequest = await req.json();

    switch (action) {
      case 'send_due_reminders': {
        // Get books due in 24-48 hours
        const { data: dueBooks, error } = await supabase
          .from('borrowing_records')
          .select(`
            *,
            books (title, author)
          `)
          .is('returned_at', null)
          .gte('due_date', new Date().toISOString())
          .lte('due_date', new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        for (const record of dueBooks || []) {
          const message = `Reminder: "${record.books.title}" by ${record.books.author} is due on ${new Date(record.due_date).toLocaleDateString()}. Please return it on time to avoid late fees.`;
          
          await supabase.from('notifications').insert({
            type: 'due_reminder',
            recipient_phone: record.borrower_phone,
            recipient_email: record.borrower_email,
            message
          });
        }

        return new Response(
          JSON.stringify({ success: true, reminders_sent: dueBooks?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send_otp': {
        if (!phone_number || !otp_code) {
          return new Response(
            JSON.stringify({ error: 'Phone number and OTP code are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const message = `Your library admin password reset code is: ${otp_code}. This code expires in 10 minutes.`;
        
        const { error } = await supabase.from('notifications').insert({
          type: 'password_reset',
          recipient_phone: phone_number,
          message
        });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send_overdue_notices': {
        // Get overdue books
        const { data: overdueBooks, error } = await supabase
          .from('borrowing_records')
          .select(`
            *,
            books (title, author)
          `)
          .is('returned_at', null)
          .lt('due_date', new Date().toISOString())
          .eq('is_overdue', false);

        if (error) throw error;

        for (const record of overdueBooks || []) {
          const overdueDays = Math.ceil((Date.now() - new Date(record.due_date).getTime()) / (1000 * 60 * 60 * 24));
          const message = `OVERDUE NOTICE: "${record.books.title}" was due ${overdueDays} day(s) ago. Please return immediately to avoid additional fees.`;
          
          await supabase.from('notifications').insert({
            type: 'overdue_notice',
            recipient_phone: record.borrower_phone,
            recipient_email: record.borrower_email,
            message
          });

          // Update borrowing record
          await supabase
            .from('borrowing_records')
            .update({ 
              is_overdue: true, 
              overdue_days: overdueDays,
              fine_amount: overdueDays * 1.00 // $1 per day
            })
            .eq('id', record.id);
        }

        return new Response(
          JSON.stringify({ success: true, notices_sent: overdueBooks?.length || 0 }),
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
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});