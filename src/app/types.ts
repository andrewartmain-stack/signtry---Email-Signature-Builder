export interface SavedSignatureDataInterface {
  id: number;
  html: string;
  photoUrl: string;
  signatureImageUrl: string;
  monthly_goal: string;
}

export interface SignatureTemplateInterface {
  id: number;
  html: string;
  alignment: string;
}

export interface FormUserDataInterface {
  photoUrl: string;
  firstName: string;
  lastName: string;
  company: string;
  // office: string;
  jobTitle: string;
  email: string;
  phone: string;
  isSocialIconsActive: string;
  instagramLink: string;
  facebookLink: string;
  linkedinLink: string;
  xLink: string;
  youtubeLink: string;
  tiktokLink: string;
  githubLink: string;
  websiteLink: string;
  whatsappLink: string;
  instagramIconUrl: string;
  facebookIconUrl: string;
  linkedinIconUrl: string;
  xIconUrl: string;
  youtubeIconUrl: string;
  tiktokIconUrl: string;
  githubIconUrl: string;
  websiteIconUrl: string;
  whatsappIconUrl: string;
  badgeTemplate: string;
  signatureImageUrl: string;
  photoLink: string;
  nameFontSize: string;
  jobTitleFontSize: string;
  companyFontSize: string;
  emailFontSize: string;
  phoneFontSize: string;
  nameFontStyle: string;
  jobTitleFontStyle: string;
  companyFontStyle: string;
  emailFontStyle: string;
  phoneFontStyle: string;
  photoBorderRadius: string;
  buttons: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
  bannerUrl: string;
  bannerLink: string;
  photoSize: string;
  companyLogoUrl: string;
  companyLogo: string;
  signatureAlignment: string;
  signatureBackgroundColor: string;
  signatureBorderRadius: string;
  signaturePadding: string;
}

export interface ClickAnalyticsDataInterface {
  id: string;
  signature_link_id: string;
  signature_id: string;
  clicked_at: Date;
}

export interface LinkDataInterface {
  id: string;
  signature_id: string;
  link_key: string;
  target_url: string;
  created_at: Date;
  token: string;
}
