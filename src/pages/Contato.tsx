import React, { useState } from 'react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * Contato Page - Based on architecture document
 * Function: institucional, não comercial
 */
const Contato: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    instituicao: '',
    profissao: '',
    contato: '',
    mensagem: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const audiences = [
    { icon: '📰', title: 'Jornalistas' },
    { icon: '🔬', title: 'Pesquisadores' },
    { icon: '🏛️', title: 'Organizações da sociedade civil' },
    { icon: '📋', title: 'Gestores públicos' },
    { icon: '🤝', title: 'Instituições interessadas' }
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-text mb-6">
              Contato
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Fale com o Observatório das Políticas de Governança de Terras.
            </p>
          </div>
        </Container>
      </section>

      {/* Who we talk to */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Diálogo"
            title="O OPGT está aberto ao diálogo com"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {audiences.map((item, index) => (
              <Card key={index} variant="ghost" padding="md" className="text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <span className="text-body-sm font-medium text-text">{item.title}</span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <SectionHeader
                label="Formulário"
                title="Envie sua mensagem"
              />

              <Card variant="elevated" padding="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nome" className="block text-body-sm font-medium text-text mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        required
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                 text-body-md"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="instituicao" className="block text-body-sm font-medium text-text mb-2">
                        Instituição
                      </label>
                      <input
                        type="text"
                        id="instituicao"
                        name="instituicao"
                        value={formData.instituicao}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                 text-body-md"
                        placeholder="Organização ou empresa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="profissao" className="block text-body-sm font-medium text-text mb-2">
                        Profissão
                      </label>
                      <select
                        id="profissao"
                        name="profissao"
                        value={formData.profissao}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                 text-body-md bg-white"
                      >
                        <option value="">Selecione...</option>
                        <option value="jornalista">Jornalista</option>
                        <option value="pesquisador">Pesquisador / Acadêmico</option>
                        <option value="gestor">Gestor Público</option>
                        <option value="sociedade-civil">Sociedade Civil</option>
                        <option value="consultor">Consultor</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contato" className="block text-body-sm font-medium text-text mb-2">
                        Email ou telefone *
                      </label>
                      <input
                        type="text"
                        id="contato"
                        name="contato"
                        required
                        value={formData.contato}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                 text-body-md"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensagem" className="block text-body-sm font-medium text-text mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      required
                      rows={5}
                      value={formData.mensagem}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                               text-body-md resize-none"
                      placeholder="Como podemos ajudar?"
                    />
                  </div>

                  <Button variant="primary" className="w-full md:w-auto">
                    Enviar mensagem
                  </Button>

                  <p className="text-body-sm text-text-muted">
                    * Campos obrigatórios
                  </p>
                </form>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div>
              <SectionHeader
                label="Informações"
                title="Canais de contato"
              />

              <div className="space-y-4">
                <Card variant="default" padding="md">
                  <div className="flex items-start gap-4">
                    <div className="icon-box flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-body-md font-semibold text-text mb-1">Email geral</h4>
                      <a href="mailto:contato@opgt.org.br" className="text-primary hover:text-primary-dark text-body-sm">
                        contato@opgt.org.br
                      </a>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="md">
                  <div className="flex items-start gap-4">
                    <div className="icon-box-terra flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-body-md font-semibold text-text mb-1">Imprensa</h4>
                      <a href="mailto:imprensa@opgt.org.br" className="text-secondary hover:text-secondary-dark text-body-sm">
                        imprensa@opgt.org.br
                      </a>
                    </div>
                  </div>
                </Card>

                <Card variant="ghost" padding="md">
                  <h4 className="text-body-md font-semibold text-text mb-2">Horário de resposta</h4>
                  <p className="text-body-sm text-text-secondary">
                    Respondemos mensagens em até 48 horas úteis.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-primary">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-display-lg text-white mb-6">
              Receba atualizações do OPGT
            </h2>
            <p className="text-body-lg text-white/80 mb-8">
              Cadastre-se para receber notificações sobre novos relatórios, notas técnicas e atualizações do dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="px-6 py-3 rounded-lg text-body-md bg-white/10 text-white placeholder-white/50
                         border border-white/20 focus:outline-none focus:border-white/40
                         w-full sm:w-80"
              />
              <Button variant="secondary">
                Inscrever-se
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Contato;
