import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-bordeaux/10 bg-beige-light/95 backdrop-blur supports-[backdrop-filter]:bg-beige-light/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-playfair text-2xl font-bold text-bordeaux">
            Intemporel
          </span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="font-montserrat text-sm font-medium text-bordeaux hover:text-bordeaux-light transition-colors"
          >
            Menu
          </Link>
        </nav>
      </div>
    </header>
  )
}
