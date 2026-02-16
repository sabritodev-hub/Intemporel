'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DiagnosticResult {
  name: string
  status: 'ok' | 'error' | 'warning' | 'pending'
  message: string
}

export default function DiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // 1. Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    diagnostics.push({
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      status: supabaseUrl && !supabaseUrl.includes('votre-projet') ? 'ok' : 'error',
      message: supabaseUrl
        ? (supabaseUrl.includes('votre-projet')
          ? '❌ Valeur par défaut détectée! Remplacez par votre vraie URL Supabase'
          : `✅ ${supabaseUrl.substring(0, 40)}...`)
        : '❌ Non définie',
    })

    diagnostics.push({
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      status: supabaseKey && !supabaseKey.includes('votre-anon') ? 'ok' : 'error',
      message: supabaseKey
        ? (supabaseKey.includes('votre-anon')
          ? '❌ Valeur par défaut détectée! Remplacez par votre vraie clé'
          : `✅ Définie (${supabaseKey.substring(0, 20)}...)`)
        : '❌ Non définie',
    })

    setResults([...diagnostics])

    // 2. Tester la connexion à Supabase
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('votre-projet')) {
      try {
        const supabase = createClient()

        // Test connexion basique
        const { data, error } = await supabase.from('categories').select('*').limit(1)

        diagnostics.push({
          name: 'Connexion à la base de données',
          status: error ? 'error' : 'ok',
          message: error ? `❌ ${error.message}` : '✅ Connexion réussie!',
        })

        if (!error) {
          // Compter les données
          const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
          const { count: platCount } = await supabase.from('plats').select('*', { count: 'exact', head: true })
          const { count: optCount } = await supabase.from('options').select('*', { count: 'exact', head: true })

          diagnostics.push({
            name: 'Données dans la BDD',
            status: (catCount || 0) > 0 ? 'ok' : 'warning',
            message: `Catégories: ${catCount || 0}, Plats: ${platCount || 0}, Options: ${optCount || 0}`,
          })
        }

        // Vérifier l'authentification
        const { data: authData } = await supabase.auth.getSession()
        diagnostics.push({
          name: 'Session utilisateur',
          status: authData.session ? 'ok' : 'warning',
          message: authData.session
            ? `✅ Connecté: ${authData.session.user.email}`
            : '⚠️ Aucune session active (normal si pas connecté)',
        })

      } catch (e: any) {
        diagnostics.push({
          name: 'Connexion à la base de données',
          status: 'error',
          message: `❌ Exception: ${e.message}`,
        })
      }
    } else {
      diagnostics.push({
        name: 'Connexion à la base de données',
        status: 'error',
        message: '⏭️ Ignoré - Configurez d\'abord les variables d\'environnement',
      })
    }

    setResults([...diagnostics])
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-beige-light p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-playfair text-3xl font-bold text-bordeaux">
            🔧 Diagnostic Supabase
          </h1>
          <p className="mt-2 text-bordeaux/70">
            Vérification de la configuration et de la connexion
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Résultats du diagnostic</span>
              <Button
                onClick={runDiagnostics}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                {isRunning ? 'Test en cours...' : '🔄 Relancer'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="font-semibold">{result.name}</div>
                <div className="text-sm mt-1 font-mono">{result.message}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Comment configurer Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                Allez sur <a href="https://supabase.com" target="_blank" className="text-bordeaux underline">supabase.com</a> et créez un compte gratuit
              </li>
              <li>
                Créez un nouveau projet (notez le mot de passe de la BDD)
              </li>
              <li>
                Dans <strong>Settings → API</strong>, copiez:
                <ul className="list-disc pl-5 mt-1">
                  <li><code>Project URL</code> → NEXT_PUBLIC_SUPABASE_URL</li>
                  <li><code>anon public</code> → NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  <li><code>service_role</code> → SUPABASE_SERVICE_ROLE_KEY</li>
                </ul>
              </li>
              <li>
                Modifiez le fichier <code>.env.local</code> avec vos vraies clés
              </li>
              <li>
                <strong>Redémarrez le serveur Next.js</strong> (Ctrl+C puis npm run dev)
              </li>
              <li>
                Dans Supabase SQL Editor, exécutez <code>supabase/migrations/001_initial_schema.sql</code>
              </li>
              <li>
                (Optionnel) Exécutez <code>supabase/fixtures.sql</code> pour les données de test
              </li>
            </ol>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mt-4">
              <strong>⚠️ Important:</strong> Après modification du .env.local, vous DEVEZ redémarrer le serveur Next.js!
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a href="/admin/login" className="text-bordeaux underline">
            ← Retour à la page de connexion
          </a>
        </div>
      </div>
    </div>
  )
}
