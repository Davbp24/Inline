import { DM_Sans } from 'next/font/google'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm',
})

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${dmSans.variable} ${dmSans.className} bg-[#FDFBF7] text-[#1C1E26] min-h-screen antialiased`}>
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  )
}
