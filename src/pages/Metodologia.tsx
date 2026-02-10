import React from 'react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Tag from '../components/ui/Tag';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * Metodologia Page - Based on architecture document
 * Function: confiança, transparência e defesa técnica
 */
const Metodologia: React.FC = () => {
  const principles = [
    {
      title: 'Dados públicos',
      description: 'Uso exclusivo de dados públicos como fonte de informação',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: 'Transparência',
      description: 'Transparência sobre fontes, métodos e limitações',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Rigor técnico',
      description: 'Rigor técnico e controle de qualidade em todas as análises',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Independência',
      description: 'Independência institucional em relação a governos e grupos de interesse',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      title: 'Interesse público',
      description: 'Compromisso com o interesse público como norteador de todas as ações',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const dataSourceCriteria = [
    'Possuem componente geoespacial',
    'Apresentam critérios técnicos de validação',
    'Permitem rastreabilidade e análise consistente'
  ];

  const limitations = [
    {
      title: 'Inconsistências históricas',
      description: 'Parte dos sistemas públicos apresenta inconsistências históricas que afetam a qualidade dos dados.'
    },
    {
      title: 'Séries históricas incompletas',
      description: 'Nem todos os dados estão disponíveis em séries históricas completas.'
    },
    {
      title: 'Cadastros autodeclaratórios',
      description: 'Alguns cadastros possuem caráter autodeclaratório, o que pode gerar inconsistências.'
    }
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-text mb-6">
              Metodologia
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Transparência metodológica como princípio fundamental do OPGT.
            </p>
          </div>
        </Container>
      </section>

      {/* Principles */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Fundamentos"
            title="Princípios"
            description="A atuação do OPGT é orientada por princípios claros que garantem a qualidade e credibilidade das análises."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <Card key={index} variant="default">
                <div className="icon-box mb-4">
                  {principle.icon}
                </div>
                <h3 className="text-display-sm text-text mb-2">
                  {principle.title}
                </h3>
                <p className="text-body-md text-text-secondary">
                  {principle.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Data Sources */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Dados"
            title="Fontes de dados"
            description="O Observatório trabalha com bases fundiárias e territoriais públicas, incluindo sistemas federais e estaduais."
          />

          <Card variant="elevated" padding="lg" className="max-w-3xl mb-8">
            <h3 className="text-body-lg font-semibold text-text mb-4">
              Priorizamos cadastros que:
            </h3>
            <ul className="space-y-4">
              {dataSourceCriteria.map((criteria, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-body-sm">
                    {index + 1}
                  </div>
                  <span className="text-body-md text-text-secondary pt-1">{criteria}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['SIGEF', 'SNCI', 'CAR', 'SNCR'].map((system, index) => (
              <Card key={index} variant="bordered" padding="md" className="text-center">
                <span className="text-body-lg font-semibold text-primary">{system}</span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Limitations */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Transparência"
            title="Limitações"
            description="Reconhecemos as limitações dos dados e métodos utilizados. Essas limitações são explicitadas em cada análise, evitando interpretações indevidas."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {limitations.map((limitation, index) => (
              <Card key={index} variant="ghost" padding="lg" className="border-l-4 border-secondary">
                <h3 className="text-display-sm text-text mb-3">
                  {limitation.title}
                </h3>
                <p className="text-body-md text-text-secondary">
                  {limitation.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Methodology Types */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Abordagens"
            title="Metodologias específicas"
            description="Diferentes metodologias para diferentes produtos"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" padding="lg">
              <Tag variant="primary" className="mb-4">Dashboard</Tag>
              <h3 className="text-display-sm text-text mb-3">
                Metodologia do Data Panel
              </h3>
              <p className="text-body-md text-text-secondary">
                Processamento e visualização de dados fundiários para consulta pública.
              </p>
            </Card>

            <Card variant="default" padding="lg">
              <Tag variant="secondary" className="mb-4">Mapas</Tag>
              <h3 className="text-display-sm text-text mb-3">
                Metodologia Espacial
              </h3>
              <p className="text-body-md text-text-secondary">
                Tratamento de dados geoespaciais e criação de camadas interativas.
              </p>
            </Card>

            <Card variant="default" padding="lg">
              <Tag variant="subtle" className="mb-4">Relatórios</Tag>
              <h3 className="text-display-sm text-text mb-3">
                Metodologia Analítica
              </h3>
              <p className="text-body-md text-text-secondary">
                Análise qualitativa e quantitativa para produção de relatórios.
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Metodologia;
