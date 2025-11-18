import { createClient } from "../utils/supabase/server";

import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let fullName: string = '';
  let email: string = '';
  let avatarUrl: string | null = null;
  let id: string = ''
  let priceId: string = ''

  if (user) {
    // Fetch the full name from the 'profiles' table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, price_id')
      .eq('id', user.id)
      .single();

    fullName = profileData?.full_name as string;
    email = user.email as string;
    avatarUrl = profileData?.avatar_url as string | null;
    id = user.id as string;
    priceId = profileData?.price_id as string;
  }

  let plan: string = '';

  switch (priceId) {
    case process.env.NEXT_PUBLIC_PRICE_ID_BASIC_MONTHLY:
      plan = "Basic" as string;
      break;
    case process.env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY:
      plan = "Basic" as string;
      break;
    case process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_MONTHLY:
      plan = "Professional" as string;
      break;
    case process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_YEARLY:
      plan = "Professional" as string;
      break;
    case "unlimited_edition_for_admin_only":
      plan = "Admin" as string;
      break;
  }

  return (
    <ClientLayoutWrapper initialUserData={{ id, fullName, avatarUrl, plan, email }}>
      {children}
    </ClientLayoutWrapper>
  );
}
