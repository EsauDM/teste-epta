'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from 'next/link'
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { api } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setIsLoading(true)

    try {
      const response = await api.post('/auth/signin', {
        email: email,
        password: senha,
      })

      const { access_token, refresh_token } = response.data

      Cookies.set('drivo.token', access_token)
      Cookies.set('drivo.refreshToken', refresh_token)

      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      const meResponse = await api.get('/auth/me')

      const dadosUsuario = {
        nome: meResponse.data.name || meResponse.data.nome,
        email: meResponse.data.email
      }

      localStorage.setItem('drivo-user', JSON.stringify(dadosUsuario))

      router.push('/home')
    } catch (error: any) {
      setErro(
        error.response?.data?.message || 'E-mail ou senha incorretos. Tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p6 overflow-hidden ">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full min-h-[calc(100vh-3rem)] flex flex-col md:flex-row gap-6 lg:gap-12 "
          >

          <div className="w-full md:w-1/2 relative h-[350px] md:h-[calc(100vh-3rem)] max-h-[900px] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-zinc-800 flex flex-col justify-end">
            <img
            src="./login.jpg"
            alt="Lateral da pagina de login"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-event-none"
            loading="eager"
            draggable={false}
           />

          <div className="relative z-10 p-8 md:p-12 space-y-4 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Sua garagem, <br />
              sempre à mão.
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              Placa, Renavam e licenciamento de todos os veículos em um só lugar.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 text-zinc-100 py-8 md:py-0">
          <div className="w-full max-w-sm mx-auto space-y-10">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="mb-2 flex items-center justify-center">
                <img
                  src="/car.jpg"
                  alt="Icone"
                  className="w-30 h-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Entrar no Drivo
              </h1>
              <p className="text-zinc-400">
                Seus veículos, documentos e dados em um só lugar.
              </p>
            </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-sm bg-zinc-800 text-white placeholder:text-zinc-600 focus:visible:ring-zing-700 "
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="*********"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="rounded-sm bg-zinc-800 text-white placeholder:text-zinc-600 focus:visible:ring-zinc-700 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 active:text-zinc-200 bg-transparent border-0 p-0 outline-none cursor-pointer flex items-center justify-center"
                    >
                      { showPassword ? <EyeOff size={18} /> : <Eye size={18} /> }
                    </button>
                  </div>
                </div>

              {erro && <p className="text-red-500 text-sm font-medium">{erro}</p>}
              <Button type="submit" disabled={isLoading} className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-400 mt-4 h-11 text-base font-medium active:bg-blue-500 disabled:bg-blue-900">
                  {isLoading ? 'Entrando... ' : 'Entrar'}
                </Button>

              </form>

              <div className="text-center text-sm text-zinc-400 pt-2">
                Ainda não tem conta?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-semibold transition-colors">
                  Criar conta
                </Link>
              </div>
          </div>
          </div>
          </motion.div>
      </div>
  )
}
