import localFont from 'next/font/local';

/**
 * Keep the administration typography aligned with the public website without
 * duplicating font assets. The source files remain owned by apps/web.
 */
export const expoArabic = localFont({
  src: [
    {
      path: '../../web/app/fonts/expo-arabic/ExpoArabic-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../web/app/fonts/expo-arabic/ExpoArabic-Book.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../web/app/fonts/expo-arabic/ExpoArabic-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../web/app/fonts/expo-arabic/ExpoArabic-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../web/app/fonts/expo-arabic/ExpoArabic-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-expo-arabic',
  display: 'swap',
});
