import type { Metadata } from 'next'
import { Montserrat, Poppins } from 'next/font/google'
import '../shared/styles/globals.css';
import { Provider } from '@/src/shared/context/provider';
import { ThemeProvider } from '@/src/shared/components/global/theme-provider';

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'SIM - Simple Inventory Management', 
  description: 'SIM - Simple Inventory Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.variable} ${poppins.variable} font-['Montserrat',sans-serif]`}>
        <Provider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  )
}