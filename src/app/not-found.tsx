import Link from 'next/link'
import { Home, FileQuestion } from 'lucide-react'
import { Button } from '@/src/shared/components/global/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <FileQuestion className="w-24 h-24 text-primary relative z-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-foreground">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Página não encontrada
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Se você acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  )
}

