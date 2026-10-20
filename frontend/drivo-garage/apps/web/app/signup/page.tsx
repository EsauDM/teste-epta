'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from 'next/link'
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { CheckCircle2, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const temLetra = /[a-zA-Z]/.test(senha)
    const temEspecial = /[!@#$%^&(),.?":{}|<>]/.test(senha)

    if (senha.length < 8 || !temLetra || !temEspecial) {
      setErro('A senha deve ter no minimo 8 caracteres, contendo letras e caracteres especiais')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Tente novamente.')
      return;
    }

    setIsLoading(true)

    try {
      await api.post('/auth/signup', {
        name: nome,
        email: email,
        password: senha,
      })

      setShowSuccessDialog(true)

    } catch (error: any) {
      setErro(
        error.response?.data?.message || 'Ocorreu um erro ao criar a conta.'
      )
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-6 overflow-hidden ">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full min-h-[calc(100vh-3rem)] flex flex-col md:flex-row gap-6 lg:gap-12 "
          >

          <div className="w-full md:w-1/2 relative h-[350px] md:h-[calc(100vh-3rem)] max-h-[900px] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-zinc-800 flex flex-col justify-end">
            <img
            src="./cadastro.jpg"
            alt="Lateral da pagina de cadastro"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-event-none"
            loading="eager"
            draggable={false}
           />

          <div className="relative z-10 p-8 md:p-12 space-y-4 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Cadastre uma vez. <br />
              O CRLV faz o resto.
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              Importe o documento e os dados do veículo são preenchidos automaticamente.
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
                Criar sua conta
              </h1>
              <p className="text-zinc-400">
                Leva menos de um minuto. Depois é só adicionar seus veículos.
              </p>
            </div>

            <form  className="space-y-5" onSubmit={handleCadastro}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Nome completo</Label>
                <Input
                  id="name"
                  type="string"
                  placeholder="João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-sm bg-zinc-800 text-white placeholder:text-zinc-600 focus:visible:ring-zinc-700 "
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="*********"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
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

                {erro && <p className="text-red-500 text-sm">{erro}</p>}
                <Button type="submit" disabled={isLoading}  className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-400 mt-4 h-11 text-base font-medium active:bg-blue-500 disabled:bg-blue-900">
                  {isLoading ? 'Criando conta... ' : 'Cadastrar'}
                </Button>



              </form>

              <div className="text-center text-sm text-zinc-400 pt-2">
                Já tem uma conta?{' '}
                <Link href="/" className="text-blue-600 hover:underline font-semibold transition-colors">
                  Entrar
                </Link>
              </div>
          </div>
          </div>
      </motion.div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent className="bg-[#18181b] border-zinc-800/60 rounded-2xl max-w-md p-6 sm:p-8">
                  <AlertDialogHeader className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                      <CheckCircle2 size={24} strokeWidth={2} />
                    </div>

                    <AlertDialogTitle className="text-xl font-bold text-white">
                      Conta criada com sucesso!
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-zinc-400 text-[13px] leading-relaxed max-w-[280px]">
                      Sua conta foi registrada na Drivo. Agora você já pode fazer o login e começar a gerenciar sua garagem.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="flex w-full mt-8">
                    <AlertDialogAction
                      onClick={() => router.push('/')}
                      className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 transition-colors"
                    >
                      Fazer login
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

      </div>
  )
}
