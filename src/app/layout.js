import { Montserrat, Tenor_Sans } from 'next/font/google';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavouritesProvider } from '../contexts/FavouritesContext';
import QueryClientProviderWrapper from '../components/QueryClientProvider';

import QueryParamProviderWrapper from '../components/QueryParamProvider';
import './globals.css';

export const metadata = {
  title: {
    default: 'ALDA - Мебель, которую выбирают сердцем',
    template: '%s | ALDA'
  },
  description: 'ALDA - интернет-магазин качественной мебели. Диваны, кресла, пуфы и другая мягкая мебель для вашего дома. Доставка по Сочи и Краснодарскому краю. Максимум комфорта в минимуме места.',
  keywords: 'мебель, диваны, кресла, пуфы, мягкая мебель, интернет-магазин, ALDA, Сочи, Краснодарский край',
  openGraph: {
    title: 'ALDA - Мебель, которую выбирают сердцем',
    description: 'ALDA - интернет-магазин качественной мебели. Диваны, кресла, пуфы и другая мягкая мебель для вашего дома.',
    type: 'website',
    locale: 'ru_RU',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
};

const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-montserrat' });
const tenorSans = Tenor_Sans({ subsets: ['latin', 'cyrillic'], weight: '400', variable: '--font-tenor-sans' });

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <Script 
          src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${montserrat.variable} ${tenorSans.variable}`}>
        <QueryClientProviderWrapper>
          <QueryParamProviderWrapper>
            <AuthProvider>
              <CartProvider>
                <FavouritesProvider>
                  <Header />
                  <main>
                    {children}
                  </main>
                  <Footer />

                </FavouritesProvider>
              </CartProvider>
            </AuthProvider>
          </QueryParamProviderWrapper>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}