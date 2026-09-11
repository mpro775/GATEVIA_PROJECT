import localFont from 'next/font/local';

export const expoArabic = localFont({
    src: [
        {
            path: './fonts/expo-arabic/ExpoArabic-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: './fonts/expo-arabic/ExpoArabic-Book.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/expo-arabic/ExpoArabic-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: './fonts/expo-arabic/ExpoArabic-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: './fonts/expo-arabic/ExpoArabic-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-expo-arabic',
    display: 'swap',
});