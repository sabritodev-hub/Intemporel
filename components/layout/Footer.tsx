export default function Footer() {
  return (
    <footer className="border-t border-bordeaux/10 bg-beige-darker py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="font-playfair text-xl font-semibold text-bordeaux">
            Intemporel
          </p>
          <p className="text-center text-sm text-bordeaux/70">
            Un moment de douceur hors du temps
          </p>
          <p className="text-xs text-bordeaux/50">
            © {new Date().getFullYear()} Intemporel. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
