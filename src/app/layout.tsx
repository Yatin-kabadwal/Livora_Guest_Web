import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import './globals.css';
import { SITE_URL, siteConfig } from '@/config/site';
import { photos } from '@/config/photos';
import { Providers } from '@/components/layout/Providers';
import { Preloader } from '@/components/layout/Preloader';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBookBar } from '@/components/layout/MobileBookBar';
import { ChatWidget } from '@/components/layout/ChatWidget';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${siteConfig.name} | Forest resort at Jim Corbett`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: siteConfig.name, locale: 'en_IN', url: SITE_URL, title: siteConfig.name, description: siteConfig.description, images: [{ url: photos.ogCover, width: 1200, height: 630, alt: siteConfig.name }] },
  twitter: { card: 'summary_large_image', title: siteConfig.name, description: siteConfig.description, images: [photos.ogCover] },
  formatDetection: { telephone: true, email: true },
};

export const viewport: Viewport = { themeColor: '#07110c', width: 'device-width', initialScale: 1 };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: siteConfig.name,
  url: SITE_URL,
  image: `${SITE_URL}${photos.ogCover}`,
  telephone: '+91 95288 27446',
  email: siteConfig.email,
  hasMap: siteConfig.mapsUrl,
  numberOfRooms: siteConfig.totalRooms,
  description: siteConfig.description,
};

// Runs before paint: skip the preloader markup for returning visitors in the same session.
const preScript = `try{if(sessionStorage.getItem('cvl_pre')==='1'){document.documentElement.dataset.pre='1'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <noscript><style>{`#preloader{display:none!important}`}</style></noscript>
      </head>
      <body className="grain font-sans">
        <a href="#main" className="fixed left-4 top-4 z-[400] -translate-y-24 rounded-full bg-gold px-5 py-3 text-sm font-bold text-forest-950 transition focus:translate-y-0">Skip to content</a>
        <Providers>
          <Preloader />
          <SmoothScroll />
          <ScrollProgress />
          <CustomCursor />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
          <Footer />
          <ChatWidget />
          <MobileBookBar />
        </Providers>
      </body>
    </html>
  );
}
