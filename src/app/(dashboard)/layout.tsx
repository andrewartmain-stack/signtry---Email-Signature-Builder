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

  if (user) {
    // Fetch the full name from the 'profiles' table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    fullName = profileData?.full_name as string;
    email = user.email as string;
    avatarUrl = profileData?.avatar_url as string | null;
    id = user.id as string;
  }

  return (
    <ClientLayoutWrapper initialUserData={{ id, fullName, avatarUrl, email }}>
      {children}
    </ClientLayoutWrapper>
  );
}
