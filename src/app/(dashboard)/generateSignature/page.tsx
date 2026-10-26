import GenerateSignaturesClient from './GenerateSignatureClient'

import { requireSubscribedSession } from '../../utils/supabase/session'

import { DEMO_USER_DATA } from '../../demoData'
import { INDUSTRY_TEMPLATES } from '../../templates/industryTemplates'

import { SignatureTemplateInterface } from '../../types'

export default async function GenerateSignaturesPage() {

  const { supabase } = await requireSubscribedSession()

  // Templates, badges and social icons are independent, so fetch them in parallel
  const [templatesResult, badgesResult, socialResult] = await Promise.all([
    supabase.from('signature_html_templates').select('*').order('id'),
    supabase.storage.from('badges').list('', { limit: 100, offset: 0 }),
    supabase.storage.from('social-icons').list('', { limit: 100, offset: 0 }),
  ])

  if (templatesResult.error) {
    console.error('Error fetching templates:', templatesResult.error);
    throw templatesResult.error;
  }

  // getPublicUrl only builds a URL locally, no network request
  const badgeTemplates: string[] = [];
  if (!badgesResult.error && badgesResult.data) {
    for (const file of badgesResult.data) {
      badgeTemplates.push(supabase.storage.from('badges').getPublicUrl(file.name).data.publicUrl);
    }
  } else {
    console.warn('Error fetching badge templates:', badgesResult.error?.message);
  }

  const socialIcons: { name: string; png: string; gif: string }[] = [];
  if (!socialResult.error && socialResult.data) {
    for (const folder of socialResult.data) {
      socialIcons.push({
        name: folder.name,
        png: supabase.storage.from('social-icons').getPublicUrl(`${folder.name}/${folder.name}.png`).data.publicUrl,
        gif: supabase.storage.from('social-icons').getPublicUrl(`${folder.name}/${folder.name}.gif`).data.publicUrl,
      });
    }
  } else {
    console.warn('Error fetching social icons:', socialResult.error?.message);
  }

  // Start with a badge and the first four social icons pre-selected
  const demoUserData = {
    ...DEMO_USER_DATA,
    badgeTemplate: badgeTemplates[0] ?? '',
    ...Object.fromEntries(socialIcons.slice(0, 4).map(icon => [`${icon.name}IconUrl`, icon.png])),
  }

  // Database templates are the general ones; industry templates ship with the app
  const templates: SignatureTemplateInterface[] = [
    ...(templatesResult.data as SignatureTemplateInterface[]).map(template => ({ ...template, category: template.category ?? 'general' })),
    ...INDUSTRY_TEMPLATES,
  ]

  return <GenerateSignaturesClient demoUserData={demoUserData} templates={templates} socialIcons={socialIcons} badgeTemplates={badgeTemplates} />
}
