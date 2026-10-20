'use client'

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import VeiculosView from "../components/veiculosView";
import { PerfilView } from "../components/perfilView";
import { useState, useEffect } from 'react'
import { api } from '@/lib/api';



export default function HomePage() {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const userInitial = `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase()
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null)

  useEffect(() => {
    const userStorage = localStorage.getItem('drivo-user')

    if (userStorage) {
      const userData = JSON.parse(userStorage)
      const nomeCompleto = userData.nome || ''

      const partesDoNome = nomeCompleto.trim().split(' ')
      setNome(partesDoNome[0] || '')
      setSobrenome(partesDoNome.slice(1).join(' ') || '')
    }
    setIsLoading(false)
  }, [])


  return (
      <div className="min-h-screen bg-black text-zinc-100 px-4 md:px-8 pb-8 pt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full min-h-[calc(100vh-3rem)] flex flex-col md:flex-row gap-6 lg:gap-12 "
        >
        <Tabs defaultValue="veículos" className="w-full">
          <div className="flex items-center justify-between w-full mb-10 pb-6">

            {/* esquerda */}
            <div className="flex flex-1 items-center gap-3">
              <div className="p-2 flex items-center justify-center">
                <img
                  src="/car.jpg"
                  alt="Logo Drivo"
                  className="w-15 h-15 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Drivo</span>
            </div>
            {/* centro */}
            <div className="flex flex-1 justify-center">
              <TabsList className="flex w-[280px] rounded-xl bg-zinc-900  p-1 h-12 items-stretch">
                <TabsTrigger
                  value="veículos"
                  className="rounded-lg flex-1 cursor-pointer w-full h-full data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 font-medium transition-all flex items-center justify-center"
                >
                  Meus veículos
                </TabsTrigger>
                <TabsTrigger
                  value='perfil'
                  className="rounded-lg flex-1 w-full cursor-pointer h-full data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 font-medium transition-all flex items-center justify-center"
                >
                  Perfil
                </TabsTrigger>
              </TabsList>
            </div>
            {/* direita */}
            <div className="flex flex-1 justify-end items-center gap-4">
              <span className="hidden md:block text-sm font-medium text-zinc-400">
                {nome} {sobrenome}
              </span>

              <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white border-2 border-black ring-2 ring-zinc-800 hover:ring-zinc-600 transition-all cursor-pointer outline-none">
                {userInitial}
              </span>
            </div>
          </div>
          {/* outras telas */}

          <TabsContent value="veículos" className="max-w-5xl mx-auto focus-visible:outline-none">
            <VeiculosView/>
          </TabsContent>

          <TabsContent value="perfil" className="max-w-5xl mx-auto focus-visible:outline-none">
            <PerfilView/>
          </TabsContent>


        </Tabs>
        </motion.div>
      </div>
  )
}
