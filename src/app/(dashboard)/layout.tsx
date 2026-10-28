import { getSession } from "../utils/supabase/session";
import { getPlanForPrice } from "../utils/stripe/plans";

import ClientLayoutWrapper from "../components/ClientLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, profile: profileData } = await getSession();

  let fullName: string = '';
  let email: string = '';
  let avatarUrl: string | null = null;
  let id: string = ''
  let plan: string = '';

  if (user) {
    fullName = profileData?.full_name as string;
    email = user.email as string;
    avatarUrl = profileData?.avatar_url as string | null;
    id = user.id as string;
    // e.g. "10 signatures", or the name of a legacy plan
    if (profileData?.is_subscribed) plan = (await getPlanForPrice(profileData.price_id))?.label ?? '';
  }

  return (
    <ClientLayoutWrapper initialUserData={{ id, fullName, avatarUrl, plan, email }}>
      {children}
    </ClientLayoutWrapper>
  );
}
