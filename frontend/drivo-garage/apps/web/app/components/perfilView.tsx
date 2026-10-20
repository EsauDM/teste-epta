import { Input } from '@workspace/ui/components/input'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function PerfilView() {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const userInitial = `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase()
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<number | string | null>(null)
  const [password, setPassword] = useState('')
  const [membroDesde, setMembroDesde] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null)

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const response = await api.get('/auth/me')

        setUserId(response.data.id)

        const nomeCompleto = response.data.name || response.data.nome || ''

        const partesDoNome = nomeCompleto.trim().split(' ')

        setNome(partesDoNome[0] || '')
        setSobrenome(partesDoNome.slice(1).join(' ') || '')
        setEmail(response.data.email)

        if (response.data.createdAT) {
          const dataCriacao = new Date(response.data.createdAT)
          const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
          }).format(dataCriacao)
          setMembroDesde(`Membro desde ${dataFormatada}`)
        }
      } catch (error) {
        setFeedback({ texto: "Não foi possivel carregar os dados do perfil.", tipo: 'erro' })
        console.error('Erro ao carregar perfil: ', error)
      } finally {
        setIsLoading(false)
      }
    }

    carregarPerfil()
  }, [])

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  async function handleUpdate() {
    if (!userId) return;

    if (novaSenha || confirmarSenha) {
      if (novaSenha !== confirmarSenha) {
        setFeedback({ texto: ' As senhas precisam ser iguais.', tipo: 'erro' })
        return
      }
      if (!senhaAtual) {
        setFeedback({ texto: ' Digite sua senha atual para autorizar a mudança.', tipo: 'erro' })
        return
      }
    }
    setIsSaving(true)
    setFeedback(null)

    try {
      const nomeCompletoParaSalvar = `${nome} ${sobrenome}`.trim()

      const payload: any = {
        name: nomeCompletoParaSalvar,
        email: email
      }

      if (novaSenha) {
        payload.currentPassword = senhaAtual
        payload.password = novaSenha
      }

      await api.patch(`/auth/${userId}`, payload)

      const dadosAtualizados = {
        nome: nomeCompletoParaSalvar,
        email: email
      }
      localStorage.setItem('drivo-user', JSON.stringify(dadosAtualizados))

      setFeedback({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' })
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setTimeout(() => setFeedback(null), 3000)
    } catch (error: any) {
      setFeedback({
        texto: error.response?.data?.message || 'ocorreu um erro ao atualizar o perfil.',
        tipo: 'erro'
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout').catch(() => {})
    } finally {
      Cookies.remove('drivo.token')
      Cookies.remove('drivo.refreshToken')

      localStorage.removeItem('drivo-user')

      window.location.href = '/'
    }
  }

  if (isLoading) {
    return (
      <div className='w-full py-24 flex flex-col items-center justify-center'>
        <div className='w-8 h-8 border-4 border-zinc-800 border-zinc-800 border-tblue-600 rounded-full animate-spin mb-4'></div>
        <p className='text-zinc-400 font-medium'>Carregando seu perfil...</p>
      </div>
    )
  }

  return (
    <div className='w-full pb-20'>
      <div className='flex items-center gap-5 mb-14'>
        <div className='w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white shrink-0'>
          {userInitial}
        </div>
        <div>
          <h1 className='text-3xl md:text-4xl font-extrabold text-white tracking-tight '>
            {nome} {sobrenome}
          </h1>
          <p className='text-zinc-400 text-sm mt-1'>
            {email} · {membroDesde}
          </p>
        </div>
      </div>

      <div className='space-y-12'>
        {/* nome */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='md:col-span-1'>
            <h3 className='text-lg font-bold text-white mb-2'>Informações pessoais</h3>
            <p className='text-sm text-zinc-400 leading-relaxed pr-4'>
              Seu nome aparece no app. O email é usado para entrar e receber avisos.
            </p>
          </div>

          <div className='md:col-span-2 bg-[#18181b] rounded-2xl overflow-hidden border border-zinc-800/40'>
            <div className='p-6 space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold text-zinc-500'>Nome</label>
                  <Input
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold text-zinc-500'>Sobrenome</label>
                  <Input
                    placeholder="Sobrenome"
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-xs font-semibold text-zinc-500'>Email</label>
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl'
                />
              </div>
            </div>

            <div className='bg-[#1c1c1e] p-4 px-6 border-t border-zinc-800/60 flex justify-between items-center'>
              <p className='text-xs text-zinc-500'>Alterações salvas ficam visíveis na hora.</p>
              <button onClick={handleUpdate} disabled={isSaving} className='bg-blue-600 cursor-pointer hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors'>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
        {/*  senha  */}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='md:col-span-1'>
            <h3 className='text-lg font-bold text-white mb-2'>Informações pessoais</h3>
            <p className='text-sm text-zinc-400 leading-relaxed pr-4'>
              Use ao menos 8 caracteres, combinando letras e números. Você continuará conectado neste dispositivo.
            </p>
          </div>

          <div className='md:col-span-2 bg-[#18181b] rounded-2xl overflow-hidden border border-zinc-800/40'>
            <div className='p-6 space-y-5'>
              <div className='space-y-2'>
                <label className='text-xs font-semibold text-zinc-500'>Senha Atual</label>
                <Input
                  type="password"
                  placeholder="Senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl font-mono'
                />
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold text-zinc-500'>Nova senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo de 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl font-mono'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold text-zinc-500'>Confirmar nova senha</label>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl font-mono'
                  />
                </div>
              </div>
            </div>

            <div className='bg-[#1c1c1e] p-4 px-6 border-t border-zinc-800/60 flex justify-between items-center'>
              <p className='text-xs text-zinc-500'>Altere sua senha com segurança</p>
              <button onClick={handleUpdate} disabled={isSaving} className='bg-zinc-700 cursor-pointer hover:bg-zinc-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors'>
                {isSaving ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </div>
        </div>
        {/*  sair */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='md:col-span-1'>
            <h3 className='text-lg font-bold text-white mb-2'>Conta</h3>
            <p className='text-sm text-zinc-400 leading-relaxed pr-4'>
              Encerre a sessão ou exclua sua conta e todos os veiculos cadastrados.
            </p>
          </div>

          <div className='md:col-span-2 bg-[#18181b] rounded-2xl overflow-hidden border border-zinc-800/40 p-6 flex justify-between items-center'>
            <div>
              <h4 className='text-white font-semibold text-sm'>Sair da conta</h4>
              <p className='text-zinc-500 text-xs mt-0.5'>Encerra a sessão neste dispositivo</p>
            </div>
            <button onClick={handleLogout} className='text-blue-500 cursor-pointer hover:text-blue-400 text-sm font-semibold transition colors px-4 py-2'>
              Sair
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}
