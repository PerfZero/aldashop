import { Montserrat, Tenor_Sans } from 'next/font/google';
import Header from '../components/Header';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-montserrat' });
const tenorSans = Tenor_Sans({ subsets: ['latin', 'cyrillic'], weight: '400', variable: '--font-tenor-sans' });

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} ${tenorSans.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}