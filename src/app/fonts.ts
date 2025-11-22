import localFont from 'next/font/local';

export const brittiSansTrial = localFont({
  src: [
    {
      path: './fonts/BrittiSansTrial-Light-BF6757bfd494951.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/BrittiSansTrial-Regular-BF6757bfd47ffbf.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/BrittiSansTrial-Bold-BF6757bfd4a96ed.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/BrittiSansTrial-LightItalic-BF6757bfd48c7c7.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/BrittiSansTrial-RegularItalic-BF6757bfd44e013.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/BrittiSansTrial-BoldItalic-BF6757bfd4a2285.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-brittisanstrial',
});
