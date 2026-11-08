import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const getAlunos = () => api.get('/alunos');
export const getTurmas = (semestre = '2026.1') => api.get(`/turmas?semestre=${semestre}`);
export const criarTurma = (turmaData) => api.post('/turmas', turmaData);
export const getMatriculasPorAluno = (alunoId) => api.get(`/matriculas/aluno/${alunoId}`);
export const realizarMatricula = (alunoId, turmaId) => api.post('/matriculas', { alunoId, turmaId });

export default api;