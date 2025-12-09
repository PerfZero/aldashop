import { Montserrat, Tenor_Sans } from 'next/font/google';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PromoBanner from '../components/PromoBanner';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavouritesProvider } from '../contexts/FavouritesContext';
import QueryClientProviderWrapper from '../components/QueryClientProvider';

import QueryParamProviderWrapper from '../components/QueryParamProvider';
import ScrollRestoration from '../components/ScrollRestoration';
import CookieConsent from '../components/CookieConsent';
import './globals.css';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ALDA',
  url: 'https://aldalinde.ru',
  logo: 'https://aldalinde.ru/logo.svg',
  description: 'ALDA - интернет-магазин качественной мебели. Диваны, кресла, пуфы и другая мягкая мебель для вашего дома.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Сочи',
    addressRegion: 'Краснодарский край',
    addressCountry: 'RU',
  },
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ALDA',
  url: 'https://aldalinde.ru',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://aldalinde.ru/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

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
  verification: {
    yandex: 'bb9d33b0513040a9',
  },
};

const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-montserrat' });
const tenorSans = Tenor_Sans({ subsets: ['latin', 'cyrillic'], weight: '400', variable: '--font-tenor-sans' });

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <Script 
          src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"
          strategy="beforeInteractive"
        />
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=105719616', 'ym');
            ym(105719616, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
      </head>
      <body className={`${montserrat.variable} ${tenorSans.variable}`}>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/105719616" style={{position: 'absolute', left: '-9999px'}} alt="" />
          </div>
        </noscript>
        <QueryClientProviderWrapper>
          <QueryParamProviderWrapper>
            <AuthProvider>
              <CartProvider>
                <FavouritesProvider>
                  <ScrollRestoration />
                  <PromoBanner />
                  <Header />
                  <main>
                    {children}
                  </main>
                  <Footer />
                  <CookieConsent />

                </FavouritesProvider>
              </CartProvider>
            </AuthProvider>
          </QueryParamProviderWrapper>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}