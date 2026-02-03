'use client'

import React, { Suspense } from "react"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Folder, File, Lock, Cloud, Users, Shield } from 'lucide-react'
import { Label } from "@/src/shared/components/global/ui/label"
import { Input } from "@/src/shared/components/global/ui/input"
import { Button } from "@/src/shared/components/global/ui"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const registered = searchParams?.get('registered') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha inválidos')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <Folder className="w-9 h-9 text-primary" fill="currentColor" />
                <Lock className="w-4 h-4 absolute -bottom-1 -right-1 text-background bg-primary rounded-full p-0.5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-primary">SIM</h2>
                <p className="text-xs text-muted-foreground">Gerenciamento seguro de arquivos</p>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                Acesse seus arquivos
              </h1>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                Faça login para gerenciar e organizar seus documentos com segurança
              </p>
            </div>
          </div>

          {registered && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 mb-4">
              <p className="text-sm text-emerald-800">
                Conta criada com sucesso! Faça login para continuar.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no SIM"}
            </Button>
          </form>

          <div className="pt-6 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Protegido com</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-xs text-center font-medium">Criptografia 256-bit</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Cloud className="w-5 h-5 text-primary" />
                <span className="text-xs text-center font-medium">Backup em nuvem</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xs text-center font-medium">Compartilhamento em equipe</span>
              </div>
            </div>
          </div>

          {/* Sign up link */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              {"Precisa de uma conta? "}
              <Link
                href="/auth/register"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - File Manager Visual */}
      <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-lg w-full">
          {/* File Browser Mockup */}
          <div className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
            {/* Browser Header */}
            <div className="bg-muted/80 px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex items-center gap-2 ml-4">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">My Documents</span>
              </div>
            </div>

            {/* File List */}
            <div className="p-6 space-y-3 bg-background">
              {[
                { name: 'Projects', icon: Folder, color: 'text-blue-500', items: '24 files' },
                { name: 'Reports-2024.pdf', icon: File, color: 'text-red-500', items: '2.4 MB' },
                { name: 'Design Assets', icon: Folder, color: 'text-purple-500', items: '156 files' },
                { name: 'Presentation.pptx', icon: File, color: 'text-orange-500', items: '8.1 MB' },
                { name: 'Team Documents', icon: Folder, color: 'text-green-500', items: '89 files' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} fill={item.icon === Folder ? 'currentColor' : 'none'} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.items}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="bg-muted/50 px-6 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">5 itens</span>
            <span className="text-xs text-muted-foreground">24,8 GB de 100 GB usados</span>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm font-semibold">Organize com facilidade</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}