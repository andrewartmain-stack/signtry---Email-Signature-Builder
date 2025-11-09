import { redirect } from 'next/navigation'

import GenerateSignaturesClient from './GenerateSignatureClient'

import { createClient } from '../../utils/supabase/server'

import { DEMO_USER_DATA } from '../../demoData'

export default async function GenerateSignaturesPage() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: profile, error: errorGettingProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

  if (errorGettingProfile) {
    console.error(errorGettingProfile.message);
    redirect('/login');
  }

  if (profile.is_subscribed === false) {
    redirect('/subscription-plan');
  }

  // Получаем шаблоны подписей
  const { data: templates, error: templatesError } = await supabase
    .from('signature_html_templates')
    .select('*');

  if (templatesError) {
    console.error('Error fetching templates:', templatesError);
    throw templatesError;
  }

  // Получаем badge templates из storage
  const { data: badgeFiles, error: badgesError } = await supabase.storage
    .from('badges')
    .list('', { limit: 100, offset: 0 });

  let badgeTemplates: string[] = [];
  if (!badgesError && badgeFiles) {
    for (let file of badgeFiles) {
      const { data } = await supabase.storage
        .from('badges')
        .getPublicUrl(file.name);
      badgeTemplates.push(data.publicUrl);
    }
  } else {
    console.warn('Error fetching badge templates:', badgesError?.message);
  }

  // Получаем social icons из storage
  const { data: socialFolders, error: socialError } = await supabase.storage
    .from('social-icons')
    .list('', { limit: 100, offset: 0 });

  let socialIcons: { name: string; png: string; gif: string }[] = [];
  if (!socialError && socialFolders) {
    for (let folder of socialFolders) {
      const { data: pngData } = await supabase.storage
        .from('social-icons')
        .getPublicUrl(`${folder.name}/${folder.name}.png`);

      const { data: gifData } = await supabase.storage
        .from('social-icons')
        .getPublicUrl(`${folder.name}/${folder.name}.gif`);

      socialIcons.push({
        name: folder.name,
        png: pngData.publicUrl,
        gif: gifData.publicUrl,
      });
    }
  } else {
    console.warn('Error fetching social icons:', socialError?.message);
  }


  return <GenerateSignaturesClient demoUserData={DEMO_USER_DATA} templates={templates} socialIcons={socialIcons} badgeTemplates={badgeTemplates} />
}