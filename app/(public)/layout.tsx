import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BandeauCookies from '@/components/legal/BandeauCookies'
import PanneauCookies from '@/components/legal/PanneauCookies'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BandeauCookies />
      <PanneauCookies />
    </div>
  )
}
