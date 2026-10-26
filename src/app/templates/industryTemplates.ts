import type { FormUserDataInterface, SignatureTemplateInterface } from '../types';

// Built-in templates for specific industries, merged with the database
// templates on the builder page. They use the same placeholder syntax
// ({{key}} and <!-- {{key_start}} --> ... <!-- {{key_end}} --> blocks), so
// renderSignature, link tracking and optimizeSignatureHtml work unchanged.
//
// Email-client rules followed by every building block below:
// - Layout is tables only; no flex, grid, floats or margins on tables.
// - Every text cell sets font-family and an explicit color (Outlook does not
//   inherit fonts into nested tables; dark mode recolors unset text).
// - Buttons put their padding and background on a <td>, because Outlook
//   ignores padding on <a>.
// - Links that should be tracked carry an id (the analytics link key).

export const TEMPLATE_CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'real-estate', label: 'Real estate' },
  { id: 'marketing', label: 'Marketing & agencies' },
  { id: 'healthcare', label: 'Doctors & healthcare' },
  { id: 'freelance', label: 'Freelancers' },
  { id: 'legal-finance', label: 'Legal & finance' },
  { id: 'corporate', label: 'Sales & corporate' },
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]['id'];

const T = 'role="presentation" cellspacing="0" cellpadding="0" border="0"';
const FONT = 'font-family:{{fontFamily}};';
const ACCENT = '{{accentColor}}';
const INK = '#111827';
const BODY = '#374151';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const block = (key: string, html: string) => `<!-- {{${key}_start}} -->${html}<!-- {{${key}_end}} -->`;

const table = (rows: string, style = '') => `<table ${T} style="border-collapse:collapse;${style}">${rows}</table>`;

const row = (content: string, style = '') => `<tr><td style="${style}">${content}</td></tr>`;

const textRow = (content: string, style: string) => row(content, `${FONT}${style}`);

const spacer = (width: number) => `<td width="${width}" style="width:${width}px;font-size:0;line-height:0;">&nbsp;</td>`;

const verticalRule = (color = ACCENT) =>
  `<td width="2" bgcolor="${color}" style="width:2px;background-color:${color};font-size:0;line-height:0;">&nbsp;</td>`;

const dividerRow = (width: string, color = ACCENT, height = 2, padding = '8px 0') =>
  row(
    table(`<tr><td height="${height}" bgcolor="${color}" style="height:${height}px;background-color:${color};font-size:0;line-height:0;">&nbsp;</td></tr>`, `width:${width};`)
      .replace('<table ', `<table width="${width.replace('px', '')}" `),
    `padding:${padding};`
  );

const photo = () =>
  `<!-- {{photoLink_start}} --><a id="photo" href="{{photoLink}}" target="_blank"><!-- {{photoLink_end}} -->` +
  `<img src="{{photoUrl}}" alt="{{firstName}} {{lastName}}" width="{{photoSize}}" height="{{photoSize}}" style="display:block;width:{{photoSize}}px;height:{{photoSize}}px;border:0;{{photoBorderRadius}}" />` +
  `<!-- {{photoLink_start}} --></a><!-- {{photoLink_end}} -->`;

const photoCell = () =>
  `<td valign="{{signatureAlignment}}" width="{{photoSize}}" style="width:{{photoSize}}px;vertical-align:{{signatureAlignment}};">${photo()}</td>`;

const badge = block(
  'badgeTemplate',
  `<img src="{{badgeTemplate}}" alt="" width="15" height="15" style="display:inline-block;width:15px;height:15px;vertical-align:middle;margin-left:4px;border:0;" />`
);

const nameRow = (color = INK, extra = '') =>
  textRow(
    `{{firstName}} {{lastName}}${block('credentials', ', {{credentials}}')}${badge}` +
      block('pronouns', ` <span style="${FONT}font-size:11px;font-weight:normal;font-style:normal;color:${MUTED};">({{pronouns}})</span>`),
    `font-size:{{nameFontSize}};{{nameFontStyle}}color:${color};line-height:1.3;padding-bottom:2px;${extra}`
  );

const jobTitleRow = (color = BODY, extra = '') =>
  block('jobTitle', textRow('{{jobTitle}}', `font-size:{{jobTitleFontSize}};{{jobTitleFontStyle}}color:${color};line-height:1.4;${extra}`));

const companyRow = (color = INK, extra = '') =>
  block('company', textRow('{{company}}', `font-size:{{companyFontSize}};{{companyFontStyle}}color:${color};line-height:1.4;${extra}`));

const licenseRow = () =>
  block('licenseNumber', textRow('{{licenseNumber}}', `font-size:11px;color:${MUTED};line-height:1.4;`));

const addressRow = (color = BODY) =>
  block('address', textRow('{{address}}', `font-size:{{emailFontSize}};color:${color};line-height:1.4;`));

const taglineRow = (style: string) => block('tagline', textRow('{{tagline}}', `line-height:1.4;${style}`));

const link = (id: string, href: string, text: string, size: string, fontStyle: string, color: string, newTab = true) =>
  `<a id="${id}" href="${href}"${newTab ? ' target="_blank"' : ''} style="${FONT}font-size:${size};${fontStyle}color:${color};text-decoration:none;">${text}</a>`;

const phoneLink = (color = BODY) => link('phone', 'tel:{{phone}}', '{{phone}}', '{{phoneFontSize}}', '{{phoneFontStyle}}', color, false);
const emailLink = (color = BODY) => link('email', 'mailto:{{email}}', '{{email}}', '{{emailFontSize}}', '{{emailFontStyle}}', color, false);
const siteLink = (color = BODY, weight = '') => link('site', '{{websiteUrl}}', '{{websiteLabel}}', '{{emailFontSize}}', weight, color);

const CONTACTS = [
  { key: 'phone', label: 'P', link: phoneLink, size: '{{phoneFontSize}}' },
  { key: 'email', label: 'E', link: emailLink, size: '{{emailFontSize}}' },
  { key: 'websiteUrl', label: 'W', link: (color?: string) => siteLink(color), size: '{{emailFontSize}}' },
];

// "P  +1 415..." rows with a colored letter in front
const labeledContactRows = (labelColor = ACCENT, textColor = BODY) =>
  CONTACTS.map(contact =>
    block(
      contact.key,
      textRow(
        `<span style="${FONT}font-weight:bold;color:${labelColor};">${contact.label}</span>&nbsp;&nbsp;${contact.link(textColor)}`,
        `font-size:${contact.size};color:${textColor};line-height:1.5;`
      )
    )
  ).join('');

const plainContactRows = (textColor = BODY) =>
  CONTACTS.map(contact => block(contact.key, textRow(contact.link(textColor), `font-size:${contact.size};color:${textColor};line-height:1.5;`))).join('');

// Phone, email and website on one line, each with a small accent square
const inlineContactRow = (textColor = BODY) =>
  row(
    table(
      `<tr>${CONTACTS.map(contact =>
        block(
          contact.key,
          `<td style="${FONT}font-size:${contact.size};color:${textColor};padding-right:12px;white-space:nowrap;"><span style="color:${ACCENT};">&#9632;</span>&nbsp;${contact.link(textColor)}</td>`
        )
      ).join('')}</tr>`
    ),
    'padding-top:4px;'
  );

const buttonsRow = (variant: 'solid' | 'outline', radius = '4px') => {
  const cell = (n: 1 | 2) =>
    block(
      `button${n}Text`,
      `<td style="padding-right:6px;">${table(
        `<tr><td${variant === 'solid' ? ` bgcolor="${ACCENT}"` : ''} style="${FONT}${variant === 'solid' ? `background-color:${ACCENT};color:#ffffff;` : `border:1px solid ${ACCENT};color:${ACCENT};`}border-radius:${radius};padding:6px 12px;">` +
          `<a id="button_${n}" href="{{button${n}Link}}" target="_blank" style="${FONT}font-size:11px;font-weight:bold;color:${variant === 'solid' ? '#ffffff' : ACCENT};text-decoration:none;">{{button${n}Text}}</a></td></tr>`
      )}</td>`
    );
  return block('buttons', row(table(`<tr>${cell(1)}${cell(2)}</tr>`), 'padding-top:8px;'));
};

const NETWORKS = [
  ['linkedin', 'LinkedIn'], ['x', 'X'], ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['whatsapp', 'WhatsApp'],
  ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['github', 'GitHub'], ['website', 'Website'],
];

const socialRow = (size = 18, gap = 6, padding = 'padding-top:8px;') =>
  block(
    'isSocialIconsActive',
    row(
      table(
        `<tr>${NETWORKS.map(([key, label]) =>
          block(
            `${key}IconUrl`,
            `<td style="padding-right:${gap}px;"><a id="${key}" href="{{${key}Link}}" target="_blank" style="display:inline-block;">` +
              `<img src="{{${key}IconUrl}}" alt="${label}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border:0;" /></a></td>`
          )
        ).join('')}</tr>`
      ),
      padding
    )
  );

const logoRow = (padding = 'padding-bottom:8px;') =>
  block('companyLogo', row(`<img src="{{companyLogoUrl}}" alt="{{company}}" style="display:block;height:28px;width:auto;border:0;" />`, padding));

const signatureRow = () =>
  block('signatureImageUrl', row(`<img src="{{signatureImageUrl}}" alt="Signature" style="display:block;height:35px;width:auto;border:0;" />`, 'padding-top:6px;'));

const banner = block(
  'bannerUrl',
  table(
    row(
      `<!-- {{bannerLink_start}} --><a id="banner" href="{{bannerLink}}" target="_blank" style="display:block;"><!-- {{bannerLink_end}} -->` +
        `<img src="{{bannerUrl}}" alt="" width="250" height="80" style="display:block;width:250px;height:80px;border:0;border-radius:5px;" />` +
        `<!-- {{bannerLink_start}} --></a><!-- {{bannerLink_end}} -->`
    ),
    'margin-top:10px;'
  )
);

// Background, corner radius and padding come from the Style step. Stacked
// templates pass a width: the attribute is what Outlook honors.
const container = (inner: string, extraStyle = '', width?: number) =>
  `<table ${T}${width ? ` width="${width}"` : ''} bgcolor="{{signatureBackgroundColor}}" style="border-collapse:collapse;background-color:{{signatureBackgroundColor}};border-radius:{{signatureBorderRadius}};color:${INK};${width ? `width:${width}px;` : ''}${extraStyle}">` +
  `<tr><td style="padding:{{signaturePadding}};">${inner}</td></tr></table>${banner}`;

const FINE_PRINT_WIDTH = 420;

const finePrintRow = (border: boolean) =>
  block(
    'tagline',
    `<tr><td colspan="3" style="padding-top:10px;">${table(
      `<tr><td style="${FONT}font-size:10px;color:${MUTED};line-height:1.4;${border ? `padding-top:8px;border-top:1px solid ${LINE};` : ''}">{{tagline}}</td></tr>`,
      `width:${FINE_PRINT_WIDTH}px;`
    ).replace('<table ', `<table width="${FINE_PRINT_WIDTH}" `)}</td></tr>`
  );

const detailsCell = (rows: string, extraStyle = '') =>
  `<td valign="{{signatureAlignment}}" style="vertical-align:{{signatureAlignment}};${extraStyle}">${table(rows)}</td>`;

interface IndustryTemplate extends SignatureTemplateInterface {
  category: TemplateCategory;
  name: string;
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 1001,
    category: 'real-estate',
    name: 'Agent card',
    alignment: 'horizontal',
    html: container(
      table(
        `<tr>${photoCell()}${spacer(14)}${verticalRule()}${spacer(14)}${detailsCell(
          logoRow() +
            nameRow() +
            jobTitleRow(ACCENT, 'text-transform:uppercase;letter-spacing:1px;') +
            companyRow(BODY) +
            licenseRow() +
            row('', 'height:6px;font-size:0;line-height:0;') +
            labeledContactRows() +
            addressRow(MUTED) +
            buttonsRow('solid') +
            socialRow() +
            signatureRow()
        )}</tr>`
      )
    ),
  },
  {
    id: 1002,
    category: 'real-estate',
    name: 'Open house',
    alignment: 'vertical',
    html: container(
      table(
        row(photo(), 'padding-bottom:10px;') +
          nameRow() +
          jobTitleRow(ACCENT) +
          companyRow() +
          licenseRow() +
          dividerRow('48px') +
          plainContactRows() +
          addressRow(MUTED) +
          buttonsRow('outline') +
          socialRow() +
          logoRow('padding-top:10px;') +
          signatureRow()
      )
    ),
  },
  {
    id: 1003,
    category: 'marketing',
    name: 'Bold agency',
    alignment: 'horizontal',
    html: container(
      table(
        `<tr>${detailsCell(
          logoRow() +
            nameRow(ACCENT) +
            jobTitleRow(INK) +
            companyRow(MUTED) +
            dividerRow('40px', ACCENT, 3) +
            inlineContactRow() +
            taglineRow(`font-size:12px;font-style:italic;color:${MUTED};padding-top:6px;`) +
            buttonsRow('solid', '20px') +
            socialRow(20) +
            signatureRow()
        )}${spacer(18)}${photoCell()}</tr>`
      )
    ),
  },
  {
    id: 1004,
    category: 'marketing',
    name: 'Studio stack',
    alignment: 'vertical',
    html: container(
      table(
        logoRow('padding-bottom:12px;') +
          row(photo(), 'padding-bottom:10px;') +
          nameRow(INK, 'font-size:{{nameFontSize}};') +
          jobTitleRow(ACCENT, 'font-weight:bold;') +
          companyRow(BODY) +
          taglineRow(`font-size:12px;color:${MUTED};padding-top:4px;`) +
          dividerRow('100%', LINE, 1, '10px 0') +
          plainContactRows() +
          buttonsRow('outline', '20px') +
          socialRow(20) +
          signatureRow()
      ),
      '',
      320
    ),
  },
  {
    id: 1005,
    category: 'healthcare',
    name: 'Clinic',
    alignment: 'horizontal',
    html: container(
      table(
        `<tr>${photoCell()}${spacer(16)}${detailsCell(
          nameRow() +
            jobTitleRow(ACCENT, 'font-weight:bold;') +
            companyRow(BODY) +
            licenseRow() +
            row('', 'height:6px;font-size:0;line-height:0;') +
            addressRow() +
            labeledContactRows() +
            buttonsRow('solid') +
            socialRow() +
            signatureRow()
        )}</tr>` +
          finePrintRow(true)
      )
    ),
  },
  {
    id: 1006,
    category: 'healthcare',
    name: 'Care team',
    alignment: 'vertical',
    html: container(
      table(
        logoRow('padding-bottom:12px;') +
          row(
            table(`<tr><td style="padding-right:12px;">${photo()}</td><td valign="middle" style="vertical-align:middle;">${table(nameRow() + jobTitleRow(ACCENT) + companyRow(BODY))}</td></tr>`),
            'padding-bottom:10px;'
          ) +
          licenseRow() +
          dividerRow('100%', LINE, 1, '8px 0') +
          labeledContactRows() +
          addressRow(MUTED) +
          buttonsRow('solid', '20px') +
          socialRow() +
          taglineRow(`font-size:10px;color:${MUTED};padding-top:10px;`)
      ),
      '',
      340
    ),
  },
  {
    id: 1007,
    category: 'freelance',
    name: 'Portfolio',
    alignment: 'horizontal',
    html: container(
      table(
        `<tr>${photoCell()}${spacer(16)}${detailsCell(
          nameRow() +
            jobTitleRow(BODY) +
            block('websiteUrl', textRow(siteLink(ACCENT, 'font-weight:bold;'), `font-size:{{emailFontSize}};color:${ACCENT};line-height:1.5;`)) +
            taglineRow(`font-size:12px;font-style:italic;color:${MUTED};`) +
            block('email', textRow(emailLink(), `font-size:{{emailFontSize}};color:${BODY};line-height:1.5;padding-top:4px;`)) +
            block('phone', textRow(phoneLink(), `font-size:{{phoneFontSize}};color:${BODY};line-height:1.5;`)) +
            buttonsRow('solid', '20px') +
            socialRow() +
            signatureRow()
        )}</tr>`
      )
    ),
  },
  {
    id: 1008,
    category: 'freelance',
    name: 'Minimal line',
    alignment: 'horizontal',
    html: container(
      table(
        `<tr>${photoCell()}${spacer(14)}${detailsCell(nameRow() + jobTitleRow(ACCENT) + companyRow(BODY) + signatureRow())}${spacer(14)}${verticalRule(LINE)}${spacer(14)}` +
          `${detailsCell(plainContactRows() + buttonsRow('outline') + socialRow(16, 6, 'padding-top:6px;'))}</tr>`
      )
    ),
  },
  {
    id: 1009,
    category: 'legal-finance',
    name: 'Classic firm',
    alignment: 'horizontal',
    html: container(
      table(
        `<tr>${photoCell()}${spacer(16)}${detailsCell(
          nameRow(INK, 'text-transform:uppercase;letter-spacing:1px;') +
            jobTitleRow(BODY) +
            companyRow(ACCENT, 'font-weight:bold;') +
            licenseRow() +
            dividerRow('100%', LINE, 1, '8px 0') +
            labeledContactRows(INK) +
            addressRow(MUTED) +
            buttonsRow('outline', '2px') +
            socialRow(16) +
            signatureRow()
        )}</tr>` +
          finePrintRow(false)
      ),
      `border-top:3px solid ${ACCENT};`
    ),
  },
  {
    id: 1010,
    category: 'corporate',
    name: 'Executive',
    alignment: 'vertical',
    html: container(
      table(
        logoRow('padding-bottom:12px;') +
          row(
            table(`<tr><td style="padding-right:12px;">${photo()}</td><td valign="middle" style="vertical-align:middle;">${table(nameRow() + jobTitleRow(BODY) + companyRow(ACCENT, 'font-weight:bold;'))}</td></tr>`)
          ) +
          dividerRow('100%', ACCENT, 2, '10px 0') +
          inlineContactRow() +
          addressRow(MUTED) +
          buttonsRow('solid') +
          socialRow() +
          signatureRow()
      ),
      '',
      360
    ),
  },
];

// Example details shown on template cards (only for fields the user has not
// changed yet), so each industry template shows what it is made for.
export const CATEGORY_SAMPLES: Partial<Record<TemplateCategory, Partial<FormUserDataInterface>>> = {
  'real-estate': {
    jobTitle: 'Realtor®', company: 'Oakwood Realty', licenseNumber: 'DRE #02145678', phone: '+14155550123',
    websiteUrl: 'https://oakwoodrealty.com', websiteLabel: 'oakwoodrealty.com', address: '1450 Market St, San Francisco, CA',
  },
  marketing: {
    jobTitle: 'Creative Director', company: 'Northwave Agency', phone: '+14155550123',
    websiteUrl: 'https://northwave.agency', websiteLabel: 'northwave.agency', tagline: 'Brands people remember.',
  },
  healthcare: {
    credentials: 'MD', jobTitle: 'Family Physician', company: 'Riverside Medical Clinic', licenseNumber: 'NPI 1234567890',
    phone: '+14155550123', address: '220 River Rd, Austin, TX',
    tagline: 'This email may contain confidential health information. If you received it by mistake, please delete it.',
  },
  freelance: {
    pronouns: 'he/him', jobTitle: 'Product Designer', company: '', websiteUrl: 'https://johndoe.design', websiteLabel: 'johndoe.design',
    tagline: 'Booking new projects from March.',
  },
  'legal-finance': {
    credentials: 'Esq.', jobTitle: 'Partner', company: 'Hale & Morgan LLP', licenseNumber: 'Bar No. 285731', phone: '+14155550123',
    address: '100 Pine St, Suite 400, San Francisco, CA', tagline: 'Confidential: this message may contain privileged information.',
  },
  corporate: {
    jobTitle: 'VP of Sales', company: 'Acme Inc.', phone: '+14155550123', websiteUrl: 'https://acme.com', websiteLabel: 'acme.com',
  },
};

// Placeholders a template uses, to show only the fields and style options
// that actually change the selected template.
export function getTemplateKeys(html: string) {
  return new Set([...html.matchAll(/{{(\w+?)(?:_start|_end)?}}/g)].map((match) => match[1]));
}
