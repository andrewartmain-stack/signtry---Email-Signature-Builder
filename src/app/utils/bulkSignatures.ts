import { FormUserDataInterface } from '../types';
import { normalizeUrl } from './normalizeUrl';
import { parseCsv, toCsv } from './parseCsv';

// Per-person columns. Everything else (template, colors, logo, banner,
// badge, icons, buttons) comes from the design built in the editor.
const PERSON_COLUMNS = ['firstName', 'lastName', 'jobTitle', 'company', 'email', 'phone', 'photo'] as const;

const SOCIAL_LINK_KEYS = [
  'linkedinLink', 'xLink', 'facebookLink', 'instagramLink', 'whatsappLink',
  'youtubeLink', 'tiktokLink', 'githubLink', 'websiteLink',
] as const;

// Per-person fields some industry templates show (MD, she/her, DRE #...).
// They get a CSV column only when the chosen template uses them.
const OPTIONAL_PERSON_COLUMNS = ['credentials', 'pronouns', 'licenseNumber'] as const;

type PersonColumn =
  | (typeof PERSON_COLUMNS)[number]
  | (typeof OPTIONAL_PERSON_COLUMNS)[number]
  | (typeof SOCIAL_LINK_KEYS)[number];

const HEADER_ALIASES: Record<string, PersonColumn> = {
  firstname: 'firstName', first: 'firstName', name: 'firstName',
  lastname: 'lastName', last: 'lastName', surname: 'lastName',
  jobtitle: 'jobTitle', title: 'jobTitle', position: 'jobTitle', role: 'jobTitle',
  company: 'company', organization: 'company',
  email: 'email', mail: 'email',
  phone: 'phone', phonenumber: 'phone', mobile: 'phone', tel: 'phone',
  photo: 'photo', photourl: 'photo', picture: 'photo', avatar: 'photo',
  credentials: 'credentials', degree: 'credentials', suffix: 'credentials',
  pronouns: 'pronouns',
  licensenumber: 'licenseNumber', license: 'licenseNumber', licence: 'licenseNumber', npi: 'licenseNumber',
  ...Object.fromEntries(
    SOCIAL_LINK_KEYS.flatMap((key) => {
      const network = key.replace(/Link$/, '').toLowerCase();
      return [[network, key], [`${network}link`, key], [`${network}url`, key]];
    })
  ),
  twitter: 'xLink', website: 'websiteLink', site: 'websiteLink',
};

export interface BulkPerson {
  rowNumber: number;
  values: Partial<Record<PersonColumn, string>>;
  photoFile?: File;
  errors: string[];
}

// Social link columns only make sense for icons enabled in the design
export function getActiveSocialLinkKeys(design: FormUserDataInterface) {
  if (!design.isSocialIconsActive) return [];
  return SOCIAL_LINK_KEYS.filter(
    (key) => design[key.replace(/Link$/, 'IconUrl') as keyof FormUserDataInterface]
  );
}

const OPTIONAL_EXAMPLES: Record<(typeof OPTIONAL_PERSON_COLUMNS)[number], string> = {
  credentials: 'MBA',
  pronouns: 'she/her',
  licenseNumber: '',
};

function getOptionalColumns(templateHtml: string) {
  return OPTIONAL_PERSON_COLUMNS.filter((key) => templateHtml.includes(`{{${key}}}`));
}

export function buildCsvTemplate(design: FormUserDataInterface, templateHtml = '') {
  const linkKeys = getActiveSocialLinkKeys(design);
  const optionalColumns = getOptionalColumns(templateHtml);
  return toCsv([
    [...PERSON_COLUMNS, ...optionalColumns, ...linkKeys],
    [
      'Jane', 'Cooper', 'Head of Sales', design.company || 'Acme Inc.', 'jane@acme.com', '+14155550123', 'jane.jpg',
      ...optionalColumns.map((key) => OPTIONAL_EXAMPLES[key]),
      ...linkKeys.map((key) => (key === 'linkedinLink' ? 'linkedin.com/in/janecooper' : '')),
    ],
  ]);
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[\s_\-.]/g, '');
}

export function parseBulkCsv(text: string, photoFiles: File[]) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { people: [] as BulkPerson[], error: 'The file needs a header row and at least one person.' };
  }

  const columns = rows[0].map((header) => HEADER_ALIASES[normalizeHeader(header)] ?? null);
  if (!columns.includes('firstName')) {
    return { people: [] as BulkPerson[], error: 'Missing a "firstName" column.' };
  }

  const filesByName = new Map(photoFiles.map((file) => [file.name.trim().toLowerCase(), file]));
  const seenEmails = new Set<string>();

  const people = rows.slice(1).map((cells, index): BulkPerson => {
    const values: BulkPerson['values'] = {};
    columns.forEach((column, columnIndex) => {
      const value = cells[columnIndex]?.trim();
      if (column && value) values[column] = value;
    });

    const errors: string[] = [];
    let photoFile: File | undefined;

    if (!values.firstName) errors.push('First name is required');

    if (values.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Invalid email');
      const email = values.email.toLowerCase();
      if (seenEmails.has(email)) errors.push('Duplicate email');
      seenEmails.add(email);
    }

    if (values.phone) values.phone = values.phone.replace(/[^0-9+]/g, '');

    if (values.photo && !/^https:\/\//i.test(values.photo)) {
      photoFile = filesByName.get(values.photo.toLowerCase());
      if (!photoFile) errors.push(`Photo "${values.photo}" was not selected`);
    }

    return { rowNumber: index + 2, values, photoFile, errors };
  });

  return { people, error: '' };
}

// The design provides the shared look; person fields always come from the
// CSV (an empty phone stays empty instead of leaking the designer's phone).
export function applyPersonToDesign(design: FormUserDataInterface, person: BulkPerson): FormUserDataInterface {
  const { values } = person;
  const links = Object.fromEntries(
    getActiveSocialLinkKeys(design).map((key) => [key, values[key] ? normalizeUrl(values[key]!) : design[key]])
  );

  return {
    ...design,
    ...links,
    firstName: values.firstName ?? '',
    lastName: values.lastName ?? '',
    jobTitle: values.jobTitle ?? '',
    company: values.company ?? design.company,
    email: values.email ?? '',
    phone: values.phone ?? '',
    credentials: values.credentials ?? '',
    pronouns: values.pronouns ?? '',
    licenseNumber: values.licenseNumber ?? '',
    // https photo URLs are used as-is; rows without a photo keep the design's
    photoUrl: values.photo && /^https:\/\//i.test(values.photo) ? values.photo : design.photoUrl,
  };
}
