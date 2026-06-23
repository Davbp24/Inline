import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import MarketingHashScroll from '@/components/marketing/MarketingHashScroll'
import { mkt } from '@/components/marketing/marketingSurfaces'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      data-marketing-layout
      className="min-h-screen overflow-x-clip bg-[#FDFBF7] text-[#1C1E26] antialiased"
      style={{ backgroundColor: mkt.creamLight }}
    >
      <MarketingNav />
      <MarketingHashScroll />
      <main className="min-w-0">{children}</main>
      <MarketingFooter />
    </div>
  )
}
