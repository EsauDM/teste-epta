import { Input } from '@workspace/ui/components/input'
import { FileText, CheckCircle2, ScanText, ImagePlus, Camera, AlertTriangle } from "lucide-react"
import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'

interface AtualizarVeiculoViewProps {
  onVoltar: () => void;
  veiculoId: string | number;
  veiculoAtual?: any;
}

export function AtualizarVeiculoView({ onVoltar, veiculoId, veiculoAtual }: AtualizarVeiculoViewProps) {
  const router = useRouter();
  const [placa, setPlaca] = useState(veiculoAtual?.plate || '')
  const [renavam, setRenavam] = useState(veiculoAtual?.renavam || '')
  const [chassi, setChassi] = useState(veiculoAtual?.chassi || '')
  const [marca, setMarca] = useState(veiculoAtual?.label || '')
  const [modelo, setModelo] = useState(veiculoAtual?.model || '')
  const [anofab, setAnoFab] = useState(veiculoAtual?.year_of_fabrication || '')
  const [anomod, setAnoMod] = useState(veiculoAtual?.model_year || '')
  const [cor, setCor] = useState(veiculoAtual?.color || '')
  const [combustivel, setCombustivel] = useState(veiculoAtual?.fuel_type || '')
  const [tipo, setTipo] = useState(veiculoAtual?.vehicle_type || '')
  const [apelido, setApelido] = useState(veiculoAtual?.nickname || '')

  const [feedback, setFeedback] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fotoVeiculo, setFotoVeiculo] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(veiculoAtual?.picture ? `${api.defaults.baseURL}${veiculoAtual.picture}` : null)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const formatarData = (data?: string) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
  }

  const formatarDataHora = (data?: string) => {
    if (!data) return '-'
    const dataObj = new Date(data)
    const hoje = new Date()
    const isHoje = dataObj.getDate() === hoje.getDate() && dataObj.getMonth() === hoje.getMonth() && dataObj.getFullYear() === hoje.getFullYear()

    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    if (isHoje) return `Hoje, ${horaFormatada}`
    return `${dataObj.toLocaleDateString('pt-BR')} às ${horaFormatada}`
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFotoVeiculo(file)
    setPreviewFoto(URL.createObjectURL(file))
  }

  async function handleImportarCRLV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/vehicles/extract-crlv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const dados = response.data
      if (dados.plate) setPlaca(dados.plate)
      if (dados.renavam) setRenavam(dados.renavam)
      if (dados.chassi) setChassi(dados.chassi)
      if (dados.label) setMarca(dados.label)
      if (dados.model) setModelo(dados.model)
      if (dados.year_of_fabrication) setAnoFab(dados.year_of_fabrication)
      if (dados.model_year) setAnoMod(dados.model_year)
      if (dados.color) setCor(dados.color)
      if (dados.fuel_type) setCombustivel(dados.fuel_type)
      if (dados.vehicle_type) setTipo(dados.vehicle_type)

    } catch (error) {
      setFeedback({ texto: 'Não foi possível ler o documento. Por favor, preencha manualmente.', tipo: 'erro' })
    } finally {
      setIsAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSalvar(e?: React.MouseEvent | React.FormEvent) {
    if (e) e.preventDefault()

    setIsSaving(true)
    setFeedback(null)

    try {
      const formData = new FormData()

      formData.append('plate', placa)
      formData.append('renavam', renavam)
      formData.append('chassi', chassi)
      formData.append('label', marca)
      formData.append('model', modelo)
      formData.append('year_of_fabrication', String(anofab))
      formData.append('model_year', String(anomod))
      formData.append('color', cor)
      formData.append('fuel_type', combustivel)
      formData.append('vehicle_type', tipo)
      formData.append('nickname', apelido)

      if (fotoVeiculo) {
        formData.append('picture', fotoVeiculo)
      }

      await api.patch(`/vehicles/${veiculoId}`, formData)

      setFeedback({ texto: 'Veículo atualizado com sucesso!', tipo: 'sucesso' })

      setTimeout(() => {
        try {
          onVoltar()
        } catch (err) {
          window.location.href = '/home'
        }
      }, 1500)
    } catch (error: any) {
      setFeedback({
        texto: error.response?.data?.message || 'Erro ao atualizar o veículo.',
        tipo: 'erro'
      })
      setIsSaving(false)
    }
  }

  async function handleExcluir() {
    setIsDeleting(true)
    setFeedback(null)

    try {
      await api.delete(`/vehicles/${veiculoId}`)

      try {
        onVoltar()
      } catch (err) {
        window.location.href = '/home'
      }
    } catch (error: any) {
      setFeedback({
        texto: error.response?.data?.message || 'Erro ao excluir o veículo.',
        tipo: 'erro'
      })
      setIsDeleting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='shrink-0 px-4 md:px-12 pt-8 pb-6 border-b border-zinc-800/60 bg-black'>
        <div className='max-w-6xl mx-auto w-full'>
          <button
            onClick={onVoltar}
            className='text-blue-500 hover:text-blue-400 text-sm font-medium mb-2 transition-colors'
          >
            Voltar
          </button>
          <h1 className='text-3xl md:text-4xl font-extrabold text-white tracking-tight'>
            {marca || modelo ? `${marca} ${modelo}` : 'Atualizar veículo'}
          </h1>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-4 md:px-12 py-8'>
        <div className='max-w-6xl mx-auto w-full mb-6'>
          {feedback && (
            <div className={`p-4 rounded-xl text-sm font-medium ${feedback.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {feedback.texto}
            </div>
          )}
        </div>

        <div className='max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6'>

          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-[#18181b] rounded-2xl border border-zinc-800/40 p-6 md:p-8'>
              <h2 className='text-lg font-bold text-white mb-1'>Identificação</h2>
              <p className='text-sm text-zinc-500 mb-6'>Dados oficiais do veículo, conforme o documento</p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Placa</label>
                  <Input
                    placeholder="Placa do veículo"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Renavam</label>
                  <Input
                    placeholder="Renavam"
                    value={renavam}
                    onChange={(e) => setRenavam(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-zinc-400'>Chassi</label>
                <Input
                  placeholder="Chassi"
                  value={chassi}
                  onChange={(e) => setChassi(e.target.value)}
                  className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                />
              </div>
            </div>

            <div className='bg-[#18181b] rounded-2xl border border-zinc-800/40 p-6 md:p-8'>
              <h2 className='text-lg font-bold text-white mb-1'>Características</h2>
              <p className='text-sm text-zinc-500 mb-6'>Como o veículo aparece na sua garagem.</p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Marca</label>
                  <Input
                    placeholder="Marca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Modelo</label>
                  <Input
                    placeholder="Modelo"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-5'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Ano de fabricação</label>
                  <Input
                    placeholder="Ano de fabricação"
                    value={anofab}
                    onChange={(e) => setAnoFab(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Ano do modelo</label>
                  <Input
                    placeholder="Ano do modelo"
                    value={anomod}
                    onChange={(e) => setAnoMod(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Cor</label>
                  <Input
                    placeholder="Cor"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-5'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Combustível</label>
                  <Input
                    placeholder="Combustível"
                    value={combustivel}
                    onChange={(e) => setCombustivel(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Tipo</label>
                  <Input
                    placeholder="Tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-zinc-400'>Apelido</label>
                  <Input
                    placeholder="Ex.: Carro da familia"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    className='bg-[#27272a] border-none text-white h-11 focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-xl uppercase'
                  />
                </div>
              </div>
            </div>

          </div>

          <div className='lg:col-span-1 space-y-6'>
            <div className='bg-[#18181b] rounded-2xl border border-zinc-800/40 p-6 flex flex-col gap-4'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-zinc-400'>Cadastrado em</span>
                <span className='text-zinc-200 capitalize'>
                  {formatarData(veiculoAtual?.createdAt)}
                </span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-zinc-400'>Última alteração</span>
                <span className='text-zinc-200'>
                  {formatarDataHora(veiculoAtual?.updatedAt)}
                </span>
              </div>
            </div>

            <div className='bg-[#18181b] rounded-2xl border border-zinc-800/40 p-6'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-[#003399]/20 flex items-center justify-center shrink-0 text-blue-500'>
                  <ScanText size={20} />
                </div>
                <div>
                  <h3 className='text-white font-bold'>Importar CRLV</h3>
                  <p className='text-zinc-500 text-xs mt-0.5 leading-relaxed'>Preenchemos o formulário para você</p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportarCRLV}
                accept=".pdf,image/*"
                className='hidden'
              />

              {!isAnalyzing && selectedFile && (
                <div className='bg-[#27272a]/50 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-4 mb-4'>
                  <div className='bg-zinc-800/50 p-2 rounded-lg'>
                    <FileText className='text-red-500' size={24} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-white truncate'>{selectedFile.name}</p>
                    <p className='text-xs text-zinc-500 mt-0.5'>{(selectedFile.size / 1024).toFixed(0)} KB · lido agora</p>
                  </div>
                  <CheckCircle2 className='text-emerald-500 shrink-0' size={20} />
                </div>
              )}

              <button
                className='w-full cursor-pointer py-3 bg-[#27272a] hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50'
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analisando...' : 'Atualizar com novo CRLV'}
              </button>
            </div>

            <div className='bg-[#18181b] rounded-2xl border border-zinc-800/40 p-6'>
              <div className='flex items-start gap-4 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-500'>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className='text-white font-bold'>Foto do veículo</h3>
                  <p className='text-zinc-500 text-xs mt-0.5 leading-relaxed'>Personalize a sua garagem</p>
                </div>
              </div>
              <input
                type="file"
                ref={fotoInputRef}
                onChange={handleFotoChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              {previewFoto ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 group">
                  <img src={previewFoto} alt="Preview do carro" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fotoInputRef.current?.click()}
                      className="text-white text-sm font-semibold bg-zinc-800/90 px-4 py-2 rounded-lg cursor-pointer hover:bg-zinc-700"
                    >
                      Trocar foto
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  className='w-full cursor-pointer py-8 border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-[#27272a]/30 text-zinc-400 text-sm font-semibold rounded-xl transition-colors flex flex-col items-center gap-3'
                >
                  <ImagePlus size={28} className="text-zinc-500" />
                  <span>Selecionar imagem</span>
                </button>
              )}
            </div>

            <div className='bg-[#18181b] rounded-2xl border border-zinc-800/40 p-6'>
              <h3 className='text-white font-bold mb-1.5'>Excluir veículo</h3>
              <p className='text-zinc-500 text-xs mb-6 leading-relaxed'>
                Remove o veículo e todos os seus dados da sua garagem. Não é possível desfazer.
              </p>

              <AlertDialog>
                <AlertDialogTrigger disabled={isDeleting} className='w-full cursor-pointer py-3 bg-[#3b1919] hover:bg-[#4a1f1f] text-[#f87171] text-sm font-semibold rounded-xl border border-[#5c2626]/50 transition-colors disabled:opacity-50'>
                  {isDeleting ? 'Excluindo...' : 'Excluir veículo'}
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-[#18181b] border-zinc-800/60 rounded-2xl max-w-md p-6 sm:p-8">
                  <AlertDialogHeader className="flex flex-col items-center text-center space-y-2">

                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-3">
                      <AlertTriangle size={24} strokeWidth={2} />
                    </div>

                    <AlertDialogTitle className="text-xl font-bold text-white">
                      Excluir {marca || modelo ? `${marca} ${modelo}` : 'veículo'}?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-zinc-400 text-[13px] leading-relaxed max-w-[280px]">
                      O veículo {placa ? `de placa ${placa}` : ''} e todos os seus dados serão removidos permanentemente.
                    </AlertDialogDescription>

                  </AlertDialogHeader>

                  <AlertDialogFooter className="flex sm:flex-row gap-3 w-full mt-8 sm:space-x-0">
                    <AlertDialogCancel className="flex-1 mt-0 bg-[#27272a] hover:bg-zinc-700 hover:text-white text-white border-none rounded-xl h-11 transition-colors">
                      Cancelar
                    </AlertDialogCancel>

                    <AlertDialogAction onClick={handleExcluir} className="flex-1 bg-[#ff453a] hover:bg-[#ff453a]/90 text-white rounded-xl h-11 transition-colors">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

        </div>
      </div>

      <div className='shrink-0 bg-[#141415] border-t border-zinc-800/60 p-4 px-4 md:px-12 flex justify-center'>
        <div className='max-w-6xl w-full flex justify-between items-center'>
          <p className='text-sm text-zinc-500 hidden md:block'>
            Editando · <span className='text-zinc-400'>{marca} {modelo}</span>
          </p>

          <div className='flex items-center gap-3 w-full md:w-auto'>
            <button
              onClick={onVoltar}
              className='flex-1 md:flex-none cursor-pointer px-6 py-2.5 bg-[#27272a] hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl transition-colors'
            >
              Cancelar
            </button>

            <button type="button" onClick={handleSalvar} disabled={isSaving} className='flex-1 md:flex-none cursor-pointer px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50'>
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
