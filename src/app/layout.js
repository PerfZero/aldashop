import { Montserrat, Tenor_Sans } from 'next/font/google';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavouritesProvider } from '../contexts/FavouritesContext';
import { Toaster } from 'react-hot-toast';
import QueryParamProviderWrapper from '../components/QueryParamProvider';
import './globals.css';

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
        <QueryParamProviderWrapper>
          <AuthProvider>
            <CartProvider>
              <FavouritesProvider>
                <Header />
                <main>
                  {children}
                </main>
                <Footer />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#4CAF50',
                      color: '#fff',
                    },
                  }}
                />
              </FavouritesProvider>
            </CartProvider>
          </AuthProvider>
        </QueryParamProviderWrapper>
      </body>
    </html>
  );
}