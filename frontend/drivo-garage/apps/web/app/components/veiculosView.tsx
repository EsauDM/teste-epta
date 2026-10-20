import { Input } from '@workspace/ui/components/input'
import { Plus, Search, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NovoVeiculoView } from './novoVeiculoView'
import { AtualizarVeiculoView } from './atualizarVeiculoView'
import { api } from '@/lib/api'

export default function VeiculosView() {
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')

  const buscarVeiculos = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/vehicles')
      setVeiculos(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        setVeiculos([])
      } else {
        setErro('Não foi possivel carregar seus veículos')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    buscarVeiculos()
  }, [])

  if (isLoading) {
    return (
      <div className='w-full py-24 flex flex-col items-center justify-center'>
        <div className='w-8 h-8 border-4 border-zinc-800 border-t-blue-600 rounded-full animate-spin mb-4 '></div>
        <p className='text-zinc-400 font-medium'> Buscando sua garagem...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className='w-full py-24 flex flex-col items-center justify-center text-center px-4'>
        <p className='text-red-500 font-medium mb-4'>{erro}</p>
        <button
          onClick={() => window.location.reload()}
          className='bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors'
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (isCreating) {
    return (
      <NovoVeiculoView
        onVoltar={() => {
          setIsCreating(false)
          buscarVeiculos()
        }}
      />
    )
  }

  if (editingVehicleId !== null) {
    const veiculoSelecionado = veiculos.find(v => v.id === editingVehicleId)
    return (
      <AtualizarVeiculoView
        onVoltar={() => {
          setEditingVehicleId(null)
          buscarVeiculos()
        }}
        veiculoId={editingVehicleId}
        veiculoAtual={veiculoSelecionado}
      />
    )
  }

  const veiculosFiltrados = veiculos.filter(v => {
    const termo = busca.toLowerCase()
    return (
      (v.plate && v.plate.toLowerCase().includes(termo)) ||
      (v.model && v.model.toLowerCase().includes(termo)) ||
      (v.label && v.label.toLowerCase().includes(termo))
    )
  })

  return (
    <div className="w-full pb-20">
      {veiculos.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl md:text-4xl font-extrabold text-white tracking-tight'>
                Meus veículos
              </h1>
              <button
                className='bg-blue-600 hover:bg-blue-500 cursor-pointer text-white rounded-full p-1.5 transition-colors'
                onClick={() => setIsCreating(true)}
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
            <p className='text-zinc-500 text-sm mt-1 font-medium'>
              {veiculos.length} veículos cadastrados
            </p>
          </div>
          <div className='relative w-full md:w-80'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' size={18} />
            <Input
              className='w-full bg-[#18181b] border-none text-white pl-10 h-11 rounded-xl placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700'
              placeholder='Buscar por placa ou modelo'
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      )}

      {veiculos.length === 0 ? (
        <div className='w-full rounded-3xl flex flex-col items-center justify-center py-24 px-4 text-center bg-[#18181b]/30'>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Sua garagem está vazia
          </h2>
          <p className='text-zinc-400 max-w-md mx-auto mb-8'>
            Adicione seu primeiro veículo. Com o CRLV em mãos, a maior parte dos dados é preenchida automaticamente
          </p>
          <button
            className='bg-blue-600 cursor-pointer hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-full transition-all flex items-center gap-2 group'
            onClick={() => setIsCreating(true)}
          >
            Importar CRLV
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {veiculosFiltrados.map((v) => (
            <div key={v.id} onClick={() => setEditingVehicleId(v.id)} className='bg-[#1c1c1e] rounded-2xl overflow-hidden group border border-transparent hover:border-zinc-800 transition-colors flex flex-col cursor-pointer' role='button' tabIndex={0}>
              <div className='relative h-40 w-full shrink-0'>
                <img
                  src={v.picture ? `${api.defaults.baseURL || ''}${v.picture}` : ''}
                  alt={v.model}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1c1c1e] to-transparent pointer-events-none'></div>
              </div>

              <div className='p-6 relative z-10 flex-1 flex flex-col'>
                <div className='flex justify-between gap-5 items-start'>
                  <div>
                    <p className='text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1'>
                      {v.label}
                    </p>
                    <h3 className='text-xl font-bold text-white leading-none'>
                      {v.model}
                    </h3>
                    <div className='flex items-center gap-1.5 mt-2'>
                      <span className='w-2 h-2 rounded-full bg-zinc-500'></span>
                      <p className='text-xs text-zinc-500 font-medium'>
                        {v.year_of_fabrication}/{v.model_year} • {v.fuel_type}
                      </p>
                    </div>
                  </div>

                  <div className='bg-white rounded-md flex flex-col items-center w-20 overflow-hidden shrink-0 shadow-sm mt-1'>
                    <div className='bg-[#003399] w-full flex justify-between items-center px-1.5 py-[3px]'>
                      <span className='text-[7px] font-bold text-white uppercase tracking-widest block leading-none'>
                        Brasil
                      </span>
                      <div className='w-2 h-[6px] bg-[#22a559] shrink-0'></div>
                    </div>
                    <div className='py-1.5'>
                      <span className='text-black font-bold text-[13px] tracking-wider leading-none'>
                        {v.plate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex justify-between items-end mt-auto pt-6 border-t border-zinc-800/60'>
                  <div className='flex gap-8'>
                    <div>
                      <p className='text-[10px] text-zinc-600 uppercase tracking-widest font-semibold'>Renavam</p>
                      <p className='text-[13px] text-zinc-300 font-mono mt-0.5'>{v.renavam}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-zinc-600 uppercase tracking-widest font-semibold'>Chassi</p>
                      <p className='text-[13px] text-zinc-300 font-mono mt-0.5'>{v.chassi}</p>
                    </div>
                  </div>

                  <button className='w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 cursor-pointer transition-all'>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            className='border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center h-full min-h-[300px] bg-transparent hover:bg-[#18181b] cursor-pointer transition-colors p-6 text-center group'
            onClick={() => setIsCreating(true)}
          >
            <div className='w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 mb-4 transition-colors'>
              <Plus size={24} />
            </div>
            <h3 className='text-white font-bold text-[15px]'>
              Adicionar Veículo
            </h3>
            <p className='text-zinc-500 text-[13px] mt-1.5'>Preencha manualmente ou importe o CRLV</p>
          </button>
        </div>
      )}
    </div>
  )
}
