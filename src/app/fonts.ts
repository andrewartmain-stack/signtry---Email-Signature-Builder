import { Geist } from 'next/font/google';

// Body and UI font (DESIGN.md). Headings use TT Neoris when it is installed
// and fall back to Geist; see --font-display in global.css.
export const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-geist',
  display: 'swap',
});
