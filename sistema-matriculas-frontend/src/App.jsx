import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Building2, UserCheck, Calendar, Clock, BookOpen, Users, Award,
  Plus, Search, Info, Check, AlertCircle, CheckCircle2, User, UserPlus
} from 'lucide-react';
import { getAlunos, getTurmas, criarTurma, getMatriculasPorAluno, realizarMatricula } from './services/api';

const DAYS_MAP = {
  '2': 'Segunda-feira',
  '3': 'Terça-feira',
  '4': 'Quarta-feira',
  '5': 'Quinta-feira',
  '6': 'Sexta-feira'
};

const TURNS_MAP = {
  '1': 'Manhã (08:00 - 11:30)',
  '2': 'Tarde (14:00 - 17:30)',
  '3': 'Noite (19:00 - 22:30)'
};

export default function App() {
  const [role, setRole] = useState('GESTOR');
  const [gestorTab, setGestorTab] = useState('ofertas'); 
  const [alunoTab, setAlunoTab] = useState('matricula');
  const [semestreAtual] = useState('2026.1');
  
  const [alunos, setAlunos] = useState([]);
  const [alunoLogado, setAlunoLogado] = useState(null);

  const [turmas, setTurmas] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formTurma, setFormTurma] = useState({
    nomeDisciplina: '',
    nomeProfessor: '',
    diaSemana: '2',
    turno: '1',
    vagasMaximas: 30,
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const inicializarDados = async () => {
    setLoading(true);
    try {
      const [resAlunos, resTurmas] = await Promise.all([
        getAlunos(),
        getTurmas(semestreAtual)
      ]);
      
      setAlunos(resAlunos.data);
      setTurmas(resTurmas.data);

      if (resAlunos.data.length > 0 && !alunoLogado) {
        setAlunoLogado(resAlunos.data[0]);
      }
    } catch (err) {
      showToast('Erro ao conectar com a API Backend (porta 8080).', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarMatriculasDoAluno = async () => {
    if (!alunoLogado) return;
    try {
      const resMatriculas = await getMatriculasPorAluno(alunoLogado.id);
      setMatriculas(resMatriculas.data);
    } catch (err) {
      showToast('Erro ao carregar matrículas do aluno.', 'error');
    }
  };

  useEffect(() => {
    inicializarDados();
  }, []);

  useEffect(() => {
    carregarMatriculasDoAluno();
  }, [alunoLogado]);

  const handleTrocarAluno = (e) => {
    const selectedId = Number(e.target.value);
    const alunoEncontrado = alunos.find(a => a.id === selectedId);
    if (alunoEncontrado) {
      setAlunoLogado(alunoEncontrado);
      showToast(`Perfil alterado para ${alunoEncontrado.nome}`, 'info');
    }
  };

  const handleCadastrarTurma = async (e) => {
    e.preventDefault();
    const codigoHorario = `${formTurma.diaSemana}${formTurma.turno}`;

    try {
      await criarTurma({
        nomeDisciplina: formTurma.nomeDisciplina,
        nomeProfessor: formTurma.nomeProfessor,
        codigoHorario,
        vagasMaximas: Number(formTurma.vagasMaximas),
        semestre: semestreAtual
      });

      showToast('Nova oferta de turma cadastrada com sucesso!', 'success');
      setFormTurma({ nomeDisciplina: '', nomeProfessor: '', diaSemana: '2', turno: '1', vagasMaximas: 30 });
      setGestorTab('ofertas');
      
      const resTurmas = await getTurmas(semestreAtual);
      setTurmas(resTurmas.data);
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao criar turma.';
      showToast(msg, 'error');
    }
  };

  const handleMatricular = async (turmaId) => {
    if (!alunoLogado) return;
    try {
      await realizarMatricula(alunoLogado.id, turmaId);
      showToast('Matrícula realizada com sucesso!', 'success');

      const [resTurmas, resMatriculas] = await Promise.all([
        getTurmas(semestreAtual),
        getMatriculasPorAluno(alunoLogado.id)
      ]);
      setTurmas(resTurmas.data);
      setMatriculas(resMatriculas.data);
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao realizar matrícula.';
      showToast(msg, 'error');
    }
  };

  const formatSchedule = (code) => {
    if (!code || code.length !== 2) return code;
    const dia = DAYS_MAP[code[0]] || `Dia ${code[0]}`;
    const turno = TURNS_MAP[code[1]] ? TURNS_MAP[code[1]].split(' ')[0] : `Turno ${code[1]}`;
    return `${dia} (${turno})`;
  };

  const turmasMatriculadasIds = matriculas.map(m => m.turma.id);

  return (
    <div className="min-h-screen flex flex-col antialiased text-slate-800">
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium max-w-md ${
          toast.type === 'error' ? 'bg-red-900 border-red-700 text-red-50' :
          toast.type === 'success' ? 'bg-emerald-900 border-emerald-700 text-emerald-50' :
          'bg-indigo-900 border-indigo-700 text-indigo-50'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
           toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> :
           <Info className="w-5 h-5 flex-shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-md flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight text-white flex items-center gap-2">
                Sistema de Atendimento e Matrículas
              </h1>
              <p className="text-xs text-slate-400">Portal Acadêmico Institucional</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setRole('GESTOR')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'GESTOR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Visão Institucional</span>
            </button>
            <button
              onClick={() => setRole('ALUNO')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'ALUNO' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Visão do Aluno</span>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-indigo-950/80 text-slate-300 border-b border-indigo-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-semibold">Perfil Atual:</span>
            <span className={`px-2 py-0.5 rounded border font-medium ${
              role === 'GESTOR' ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
            }`}>
              {role === 'GESTOR' 
                ? 'Coordenação Acadêmica (Gestor)' 
                : alunoLogado 
                  ? `Aluno: ${alunoLogado.nome} (Matrícula: ${alunoLogado.matricula})` 
                  : 'Carregando aluno...'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Semestre Vigente: <strong className="text-white">{semestreAtual}</strong>
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {role === 'GESTOR' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestão de Ofertas e Turmas</h2>
                <p className="text-xs text-slate-500">Cadastre novas turmas e acompanhe as ofertas do semestre.</p>
              </div>

              <div className="flex bg-slate-200/80 p-1 rounded-xl">
                <button
                  onClick={() => setGestorTab('ofertas')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    gestorTab === 'ofertas' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Turmas Ofertadas
                </button>
                <button
                  onClick={() => setGestorTab('cadastrar')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    gestorTab === 'cadastrar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Oferta de Turma
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total de Turmas Ofertadas</p>
                  <p className="text-2xl font-bold text-slate-900">{turmas.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total de Matrículas Ativas</p>
                  <p className="text-2xl font-bold text-slate-900">{turmas.reduce((acc, curr) => acc + curr.vagasOcupadas, 0)}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Award className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Vagas Ofertadas Totais</p>
                  <p className="text-2xl font-bold text-slate-900">{turmas.reduce((acc, curr) => acc + curr.vagasMaximas, 0)}</p>
                </div>
              </div>
            </div>

            {gestorTab === 'ofertas' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">Quadro Geral de Ofertas</h3>
                  <span className="text-xs text-slate-400">Semestre {semestreAtual}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Disciplina</th>
                        <th className="py-3 px-4">Professor Alocado</th>
                        <th className="py-3 px-4">Horário / Turno (RN01)</th>
                        <th className="py-3 px-4">Ocupação / Vagas</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {turmas.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-6 text-slate-400">Nenhuma turma cadastrada na API.</td></tr>
                      ) : (
                        turmas.map(t => {
                          const percent = Math.round((t.vagasOcupadas / t.vagasMaximas) * 100);
                          const isLotada = t.vagasOcupadas >= t.vagasMaximas;
                          return (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4 font-mono font-semibold text-xs text-indigo-600">#{t.id}</td>
                              <td className="py-3 px-4 font-semibold text-slate-900">{t.nomeDisciplina}</td>
                              <td className="py-3 px-4">{t.nomeProfessor}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 mr-2">
                                  {t.codigoHorario}
                                </span>
                                <span className="text-xs text-slate-500">{formatSchedule(t.codigoHorario)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div className={`h-2 rounded-full ${isLotada ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min(100, percent)}%` }}></div>
                                  </div>
                                  <span className="text-xs font-medium text-slate-700">{t.vagasOcupadas}/{t.vagasMaximas}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  isLotada ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isLotada ? 'LOTADA' : 'ABERTA'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {gestorTab === 'cadastrar' && (
              <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Cadastrar Nova Oferta de Turma</h3>
                  <p className="text-xs text-slate-500">As informações serão enviadas diretamente ao backend Java.</p>
                </div>

                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" /> Regra RN01 (Código de Horário):
                  </h4>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    Código de <strong>2 dígitos</strong>: 1º dígito (Dia 2-6) e 2º dígito (Turno 1=Manhã, 2=Tarde, 3=Noite).
                  </p>
                </div>

                <form onSubmit={handleCadastrarTurma} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Disciplina *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Estruturas de Dados"
                        value={formTurma.nomeDisciplina}
                        onChange={e => setFormTurma({ ...formTurma, nomeDisciplina: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Professor *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Dr. Carlos Eduardo"
                        value={formTurma.nomeProfessor}
                        onChange={e => setFormTurma({ ...formTurma, nomeProfessor: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dia da Semana *</label>
                      <select
                        value={formTurma.diaSemana}
                        onChange={e => setFormTurma({ ...formTurma, diaSemana: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      >
                        <option value="2">2 - Segunda-feira</option>
                        <option value="3">3 - Terça-feira</option>
                        <option value="4">4 - Quarta-feira</option>
                        <option value="5">5 - Quinta-feira</option>
                        <option value="6">6 - Sexta-feira</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Turno *</label>
                      <select
                        value={formTurma.turno}
                        onChange={e => setFormTurma({ ...formTurma, turno: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      >
                        <option value="1">1 - Manhã (08:00 - 11:30)</option>
                        <option value="2">2 - Tarde (14:00 - 17:30)</option>
                        <option value="3">3 - Noite (19:00 - 22:30)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Vagas *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formTurma.vagasMaximas}
                        onChange={e => setFormTurma({ ...formTurma, vagasMaximas: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setGestorTab('ofertas')} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                      Cancelar
                    </button>
                    <button type="submit" className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
                      <Check className="w-4 h-4" /> Salvar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {role === 'ALUNO' && (
          <div className="space-y-6">
            {alunoLogado ? (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xl font-bold text-indigo-200">
                    {alunoLogado.nome.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{alunoLogado.nome}</h2>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-medium">Regular</span>
                    </div>
                    <p className="text-xs text-indigo-200/80">Matrícula: {alunoLogado.matricula}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 px-2">
                    <UserPlus className="w-4 h-4 text-indigo-300" />
                    <div className="text-left">
                      <label className="block text-[10px] text-indigo-200 uppercase font-semibold">Alternar Aluno:</label>
                      <select
                        value={alunoLogado.id}
                        onChange={handleTrocarAluno}
                        className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                      >
                        {alunos.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.nome} ({a.matricula})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

                  <div className="flex items-center gap-4">
                    <div className="text-center px-3">
                      <span className="block text-xl font-bold text-white">{matriculas.length}</span>
                      <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Matérias</span>
                    </div>
                    <div className="text-center px-3">
                      <span className="block text-xl font-bold text-white">{matriculas.length * 60}h</span>
                      <span className="text-[10px] text-indigo-200 uppercase tracking-wider">Carga Horária</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border text-center text-slate-500">
                Carregando lista de alunos...
              </div>
            )}

            <div className="flex border-b border-slate-200 gap-6">
              <button
                onClick={() => setAlunoTab('matricula')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${
                  alunoTab === 'matricula' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 border-b-2 border-transparent'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Matrícula em Turmas
              </button>
              <button
                onClick={() => setAlunoTab('grade')}
                className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all ${
                  alunoTab === 'grade' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 border-b-2 border-transparent'
                }`}
              >
                <Calendar className="w-4 h-4" /> Grade Horária Semanal
              </button>
            </div>

            {alunoTab === 'matricula' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar matéria ou professor..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {turmas
                    .filter(t => t.nomeDisciplina.toLowerCase().includes(searchTerm.toLowerCase()) || t.nomeProfessor.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(t => {
                      const isEnrolled = turmasMatriculadasIds.includes(t.id);
                      const isLotada = t.vagasOcupadas >= t.vagasMaximas;

                      return (
                        <div key={t.id} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between gap-4 ${
                          isEnrolled ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-200'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  TURMA #{t.id}
                                </span>
                                <h4 className="font-bold text-slate-900 text-base mt-1">{t.nomeDisciplina}</h4>
                              </div>
                              {isEnrolled && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Matriculado
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 space-y-1">
                              <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {t.nomeProfessor}</p>
                              <p className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Horário: <strong className="text-slate-700 font-mono">{t.codigoHorario}</strong> ({formatSchedule(t.codigoHorario)})
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Vagas: <strong className="text-slate-800">{t.vagasOcupadas}/{t.vagasMaximas}</strong></span>
                            {!isEnrolled && (
                              <button
                                onClick={() => handleMatricular(t.id)}
                                disabled={isLotada}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm"
                              >
                                {isLotada ? 'Lotada' : 'Matricular-se'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {alunoTab === 'grade' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Sua Grade Semanal ({semestreAtual})</h3>
                    <p className="text-xs text-slate-500">Visualização de disciplinas com base no código de 2 dígitos.</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold border border-indigo-100">
                    Grade Sincronizada
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-center text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3 w-28 text-left">Turno / Dia</th>
                        <th className="p-3">Segunda (2)</th>
                        <th className="p-3">Terça (3)</th>
                        <th className="p-3">Quarta (4)</th>
                        <th className="p-3">Quinta (5)</th>
                        <th className="p-3">Sexta (6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {['1', '2', '3'].map(turno => (
                        <tr key={turno}>
                          <td className="p-3 font-semibold bg-slate-50 text-slate-600 text-left border-r border-slate-200">
                            <div>{turno === '1' ? 'Manhã (1)' : turno === '2' ? 'Tarde (2)' : 'Noite (3)'}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {turno === '1' ? '08:00 - 11:30' : turno === '2' ? '14:00 - 17:30' : '19:00 - 22:30'}
                            </div>
                          </td>
                          {['2', '3', '4', '5', '6'].map(dia => {
                            const code = `${dia}${turno}`;
                            const matriculaEncontrada = matriculas.find(m => m.turma.codigoHorario === code);

                            return (
                              <td key={code} className={`p-2 border-r border-slate-200 h-24 align-middle ${
                                matriculaEncontrada ? 'bg-indigo-50/90 border-l-4 border-l-indigo-600 rounded-r' : 'bg-white'
                              }`}>
                                {matriculaEncontrada ? (
                                  <div className="text-left space-y-1">
                                    <span className="text-[10px] font-bold font-mono text-indigo-700 block">TURMA #{matriculaEncontrada.turma.id}</span>
                                    <p className="font-bold text-xs text-slate-900 leading-tight">{matriculaEncontrada.turma.nomeDisciplina}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{matriculaEncontrada.turma.nomeProfessor}</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-xs">--</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}