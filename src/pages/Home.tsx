import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * Home Page - OPGT Landing
 * Based on architecture document
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const heroImageUrl = 'https://images.unsplash.com/photo-1720386063956-00296002a701?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  // Pré-carrega a imagem de fundo
  useEffect(() => {
    const img = new Image();
    img.src = heroImageUrl;
    img.onload = () => {
      setImageLoaded(true);
    };
  }, [heroImageUrl]);

  const monitoredSystems = [
    {
      name: 'SIGEF',
      description: 'Sistema de Gestão Fundiária',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      name: 'SNCI',
      description: 'Sistema Nacional de Cadastro de Imóveis Rurais',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: 'CAR',
      description: 'Cadastro Ambiental Rural',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Terras Públicas',
      description: 'Gestão e destinação de terras públicas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    }
  ];

  const partners = [
    'Artur Caldas Brandão',
    'Brenda Brito',
    'Cristina Leme Lopes',
    'Regis Bueno',
    'Suzana Daniela Rocha Santos e Silva'
  ];

  const institutions = [
    { name: 'Imazon', type: 'Instituição Parceira' },
    { name: 'Observatório do Código Florestal', type: 'Instituição Parceira' },
    { name: 'IGPP', type: 'Instituição Parceira' },
    { name: 'Land Facility', type: 'Instituição Mantenedora' },
    { name: 'IGT', type: 'Instituição Mantenedora' }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-36 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${heroImageUrl})`
          }}
        />

        {/* Dark Overlay with brand color tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-verde-escuro/80 via-black/60 to-terra/40" />

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-white mb-6 animate-slide-in-scale drop-shadow-lg opacity-0">
              Observatório das Políticas de Governança de Terras
            </h1>

            <p className="text-body-lg text-white/90 leading-relaxed mb-10 max-w-3xl animate-slide-in-left drop-shadow-md opacity-0" style={{ animationDelay: '0.2s' }}>
              Transparência, dados públicos e monitoramento qualificado da governança fundiária no Brasil.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up-bounce opacity-0" style={{ animationDelay: '0.4s' }}>
              <Button variant="secondary" size="lg" href="/dashboard">
                Acessar Dashboard de Dados
              </Button>
              <Button variant="ghost" size="lg" href="/relatorios" className="text-white border-white/30 hover:bg-white/10">
                Consulte relatórios e notas técnicas
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* About Section */}
      <section className="section-padding bg-white">
        <Container size="narrow">
          <p className="text-body-lg text-text leading-relaxed mb-6">
            O Observatório das Políticas de Governança de Terras (OPGT) é uma iniciativa independente
            dedicada a acompanhar, sistematizar e publicizar informações sobre políticas públicas
            fundiárias, com atenção especial ao cadastro territorial, aos sistemas de informação e às
            decisões institucionais que impactam o ordenamento do território brasileiro.
          </p>
          <p className="text-body-lg text-text-secondary leading-relaxed">
            Nosso objetivo é tornar acessíveis informações que hoje estão fragmentadas, dispersas ou
            de difícil compreensão, contribuindo para o fortalecimento da transparência pública, da
            segurança jurídica e da governança de terras no país.
          </p>
        </Container>
      </section>

      {/* What We Monitor */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Monitoramento"
            title="O que monitoramos"
            description="O OPGT acompanha de forma contínua os principais sistemas e políticas de governança fundiária do Brasil."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {monitoredSystems.map((system, index) => (
              <Card key={index} variant="default" hoverable onClick={() => navigate('/dashboard')}>
                <div className="icon-box mb-4">
                  {system.icon}
                </div>
                <h3 className="text-display-sm text-text mb-2">
                  {system.name}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {system.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-lg p-8 border border-border">
            <h4 className="text-body-lg font-semibold text-text mb-4">
              O OPGT também acompanha:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Sistemas de cadastro fundiário (SIGEF, SNCR e sistemas correlatos)',
                'Políticas públicas de governança de terras',
                'Integração entre cadastros fundiários e ambientais',
                'Mudanças normativas, decretos e projetos de lei com impacto territorial',
                'Processos institucionais relacionados à regularização fundiária'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                  <span className="text-body-md text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Why OPGT */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Necessidade"
            title="Por que o OPGT é necessário?"
          />

          <div className="max-w-4xl mb-12">
            <p className="text-body-lg text-text leading-relaxed mb-6">
              O Brasil possui uma estrutura fundiária historicamente marcada por fragmentação
              institucional, sobreposição de cadastros e baixa interoperabilidade entre sistemas
              públicos. Essa realidade gera insegurança jurídica, conflitos territoriais,
              dificuldades para políticas ambientais e custos elevados para a sociedade.
            </p>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              O OPGT nasce para monitorar esse cenário de forma técnica, contínua e pública,
              oferecendo dados consolidados, análises qualificadas e posicionamentos fundamentados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Informação fragmentada',
                description: 'Dados dispersos em múltiplos sistemas e órgãos dificultam a compreensão do cenário fundiário.',
                color: 'primary'
              },
              {
                title: 'Baixa transparência',
                description: 'Dificuldade de acesso e interpretação das informações públicas sobre governança de terras.',
                color: 'primary'
              },
              {
                title: 'Dificuldade de acesso',
                description: 'Sistemas públicos complexos e pouco integrados limitam o controle social.',
                color: 'secondary'
              },
              {
                title: 'Download dos dados',
                description: 'OPGT disponibiliza dados tratados para análise independente e verificação.',
                color: 'secondary'
              }
            ].map((item, index) => (
              <Card key={index} variant="ghost" padding="lg">
                <div className={`w-10 h-1 rounded-full mb-4 ${item.color === 'primary' ? 'bg-primary' : 'bg-secondary'}`} />
                <h3 className="text-display-sm text-text mb-3">
                  {item.title}
                </h3>
                <p className="text-body-md text-text-secondary">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Recent Highlights */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Publicações"
            title="Destaques recentes"
            description="Últimas publicações e atualizações do observatório"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="elevated" hoverable onClick={() => navigate('/relatorios')}>
              <Tag variant="primary" className="mb-4">Relatório</Tag>
              <h3 className="text-display-sm text-text mb-3">
                Último relatório
              </h3>
              <p className="text-body-md text-text-secondary mb-4">
                Análises periódicas sobre políticas de governança de terras
              </p>
              <span className="text-body-sm text-primary font-medium">
                Ver relatório →
              </span>
            </Card>

            <Card variant="elevated" hoverable onClick={() => navigate('/relatorios')}>
              <Tag variant="secondary" className="mb-4">Nota Técnica</Tag>
              <h3 className="text-display-sm text-text mb-3">
                Nota técnica
              </h3>
              <p className="text-body-md text-text-secondary mb-4">
                Posicionamentos técnicos sobre temas específicos
              </p>
              <span className="text-body-sm text-primary font-medium">
                Ver nota →
              </span>
            </Card>

            <Card variant="elevated" hoverable onClick={() => navigate('/relatorios')}>
              <Tag variant="subtle" className="mb-4">Atualização</Tag>
              <h3 className="text-display-sm text-text mb-3">
                Atualização relevante
              </h3>
              <p className="text-body-md text-text-secondary mb-4">
                Mudanças normativas e decisões institucionais
              </p>
              <span className="text-body-sm text-primary font-medium">
                Ver atualização →
              </span>
            </Card>
          </div>
        </Container>
      </section>

      {/* Who Builds */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Rede"
            title="Quem constrói o Observatório"
            description="Rede técnica e acadêmica por trás do OPGT"
          />

          {/* Partners Grid */}
          <div className="mb-12">
            <h3 className="text-body-lg font-semibold text-text mb-6">Parceiros</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {partners.map((partner, index) => (
                <Card key={index} variant="bordered" padding="sm">
                  <p className="text-body-sm text-text-secondary text-center font-medium">
                    {partner}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Institutions Grid */}
          <div>
            <h3 className="text-body-lg font-semibold text-text mb-6">Instituições</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((inst, index) => (
                <Card key={index} variant="default">
                  <Tag
                    variant={inst.type.includes('Mantenedora') ? 'secondary' : 'outline'}
                    size="sm"
                    className="mb-3"
                  >
                    {inst.type}
                  </Tag>
                  <h4 className="text-display-sm text-text">
                    {inst.name}
                  </h4>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Feature Cards */}
      <section className="section-padding bg-primary">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              variant="ghost"
              padding="lg"
              hoverable
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <h3 className="text-display-sm text-white mb-3">
                Dados sobre o Cadastro Territorial no Brasil
              </h3>
              <p className="text-body-md text-white/80">
                Faça sua pesquisa utilizando nosso dashboard especial
              </p>
            </Card>

            <Card
              variant="ghost"
              padding="lg"
              hoverable
              onClick={() => navigate('/relatorios')}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <h3 className="text-display-sm text-white mb-3">
                Relatórios e análises técnicas
              </h3>
              <p className="text-body-md text-white/80">
                Publicações periódicas sobre políticas de governança de terras
              </p>
            </Card>

            <Card
              variant="ghost"
              padding="lg"
              hoverable
              onClick={() => navigate('/sobre')}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <h3 className="text-display-sm text-white mb-3">
                Quem constrói o Observatório
              </h3>
              <p className="text-body-md text-white/80">
                Rede técnica e acadêmica por trás do OPGT
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-display-lg text-text mb-6">
              Explore o OPGT
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Acesse dados, relatórios e análises sobre governança fundiária no Brasil
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/dashboard">
                Explorar dados
              </Button>
              <Button variant="outline" size="lg" href="/relatorios">
                Ver relatórios
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Home;
