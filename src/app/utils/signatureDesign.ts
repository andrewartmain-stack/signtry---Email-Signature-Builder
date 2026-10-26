import { FormUserDataInterface } from '../types';
import { DEMO_BANNER, DEMO_COMPANY_LOGO_URL } from '../demoData';
import { normalizeUrl } from './normalizeUrl';

// The builder edits raw field values plus a few on/off switches; the
// template placeholders need the derived values (flags, normalized links,
// emptied images for disabled blocks). Keeping the derivation in one pure
// function means preview, single save and bulk generation all agree.

export type BuilderStepId = 'template' | 'details' | 'branding' | 'links' | 'style' | 'save';

export const BUILDER_STEPS: { id: BuilderStepId; label: string; title: string; description: string }[] = [
  { id: 'template', label: 'Template', title: 'Pick a layout', description: 'Every template works in Gmail, Outlook, Apple Mail and Yahoo. You can change it any time.' },
  { id: 'details', label: 'Details', title: 'Your details', description: 'Only your first name is required. Empty fields are left out of the signature.' },
  { id: 'branding', label: 'Branding', title: 'Logo, banner and badge', description: 'Optional extras. Images are resized and hosted for email when you save.' },
  { id: 'links', label: 'Links', title: 'Social icons and buttons', description: 'Every link is tracked, so you can see clicks in Analytics.' },
  { id: 'style', label: 'Style', title: 'Fine-tune the look', description: 'Text sizes, background and spacing.' },
  { id: 'save', label: 'Save', title: 'Review and save', description: 'Save it for yourself, or create one for every person on your team.' },
];

export interface BuilderOptions {
  handwritten: boolean;
  logo: boolean;
  banner: boolean;
  social: boolean;
  animatedIcons: boolean;
  buttons: boolean;
}

export const DEFAULT_BUILDER_OPTIONS: BuilderOptions = {
  handwritten: true,
  logo: false,
  banner: false,
  social: true,
  animatedIcons: false,
  buttons: false,
};

export interface SocialIcon {
  name: string;
  png: string;
  gif: string;
}

export const MAX_SOCIAL_ICONS = 5;

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  website: 'Website',
};

export function getSocialLabel(name: string) {
  return SOCIAL_LABELS[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

export function socialLinkKey(name: string) {
  return `${name}Link` as keyof FormUserDataInterface;
}

function socialIconKey(name: string) {
  return `${name}IconUrl` as keyof FormUserDataInterface;
}

// Icons pre-selected in the initial data (the server picks the first few)
export function getInitialSocialSelection(design: FormUserDataInterface, socialIcons: SocialIcon[]) {
  return socialIcons.filter((icon) => design[socialIconKey(icon.name)]).map((icon) => icon.name);
}

export function buildSignatureData(
  design: FormUserDataInterface,
  options: BuilderOptions,
  socialIcons: SocialIcon[],
  selectedSocial: string[]
): FormUserDataInterface {
  const showSocial = options.social && selectedSocial.length > 0;

  const social = Object.fromEntries(
    socialIcons.flatMap((icon) => {
      const isOn = showSocial && selectedSocial.includes(icon.name);
      return [
        [socialIconKey(icon.name), isOn ? (options.animatedIcons ? icon.gif : icon.png) : ''],
        [socialLinkKey(icon.name), isOn ? normalizeUrl((design[socialLinkKey(icon.name)] ?? '').trim()) : ''],
      ];
    })
  );

  return {
    ...design,
    ...social,
    isSocialIconsActive: showSocial ? '1' : '',
    signatureImageUrl: options.handwritten ? design.signatureImageUrl : '',
    companyLogo: options.logo ? '1' : '',
    companyLogoUrl: options.logo ? design.companyLogoUrl || DEMO_COMPANY_LOGO_URL : '',
    bannerUrl: options.banner ? design.bannerUrl || DEMO_BANNER : '',
    bannerLink: options.banner ? normalizeUrl(design.bannerLink.trim()) : '',
    buttons: options.buttons ? '1' : '',
    button1Text: options.buttons ? design.button1Text.trim() : '',
    button1Link: options.buttons ? normalizeUrl(design.button1Link.trim()) : '',
    button2Text: options.buttons ? design.button2Text.trim() : '',
    button2Link: options.buttons ? normalizeUrl(design.button2Link.trim()) : '',
    photoLink: normalizeUrl(design.photoLink.trim()),
    websiteUrl: normalizeUrl(design.websiteUrl.trim()),
    websiteLabel: getWebsiteLabel(design.websiteUrl),
  };
}

// "https://www.acme.com/" -> "acme.com": how a website reads in a signature
export function getWebsiteLabel(url: string) {
  return url.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
}

export interface DesignIssue {
  step: BuilderStepId;
  field: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Everything that would make the saved signature broken or incomplete
export function getDesignIssues(
  design: FormUserDataInterface,
  options: BuilderOptions,
  selectedSocial: string[]
): DesignIssue[] {
  const issues: DesignIssue[] = [];

  if (!design.firstName.trim()) {
    issues.push({ step: 'details', field: 'firstName', message: 'Add your first name' });
  }

  if (design.email.trim() && !EMAIL_PATTERN.test(design.email.trim())) {
    issues.push({ step: 'details', field: 'email', message: 'Email address looks incomplete' });
  }

  if (options.social) {
    selectedSocial.forEach((name) => {
      if (!(design[socialLinkKey(name)] ?? '').trim()) {
        issues.push({ step: 'links', field: socialLinkKey(name), message: `Add a link for ${getSocialLabel(name)}` });
      }
    });
  }

  if (options.buttons) {
    ([1, 2] as const).forEach((n) => {
      const text = design[`button${n}Text`].trim();
      const link = design[`button${n}Link`].trim();
      if (text && !link) {
        issues.push({ step: 'links', field: `button${n}Link`, message: `Add a link for button ${n}` });
      }
    });
    if (!design.button1Text.trim() && !design.button2Text.trim()) {
      issues.push({ step: 'links', field: 'button1Text', message: 'Give at least one button a label, or turn buttons off' });
    }
  }

  return issues;
}
