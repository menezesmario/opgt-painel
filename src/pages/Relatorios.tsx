import React from 'react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * Relatórios Page - Based on architecture document
 * Function: profundidade + autoridade + imprensa
 */
const Relatorios: React.FC = () => {
  const publicationTypes = [
    {
      type: 'Relatórios analíticos',
      description: 'Análises aprofundadas sobre políticas fundiárias',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      type: 'Notas técnicas',
      description: 'Posicionamentos sobre temas específicos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      type: 'Posicionamentos públicos',
      description: 'Diante de mudanças normativas relevantes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    },
    {
      type: 'Sumários executivos',
      description: 'Voltados a tomadores de decisão e imprensa',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-text mb-6">
              Relatórios
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Análises técnicas para qualificar o debate público sobre governança de terras.
            </p>
          </div>
        </Container>
      </section>

      {/* What we produce */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Publicações"
            title="O que o OPGT produz"
            description="Os relatórios buscam equilibrar rigor técnico e clareza, permitindo que diferentes públicos compreendam os impactos institucionais e territoriais das políticas monitoradas."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {publicationTypes.map((item, index) => (
              <Card key={index} variant="default">
                <div className={`mb-4 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>
                  {item.icon}
                </div>
                <h3 className="text-body-lg font-semibold text-text mb-2">
                  {item.type}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          <Card variant="ghost" padding="lg" className="border-l-4 border-primary">
            <p className="text-body-lg text-text-secondary">
              Cada publicação inclui: <strong className="text-text">contexto, metodologia resumida,
              principais achados, download (PDF) e sumário executivo</strong>.
            </p>
          </Card>
        </Container>
      </section>

      {/* Reports Section */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Monitoramento de Políticas"
            title="Relatórios disponíveis"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Report Card */}
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Tag variant="primary">Relatório</Tag>
                <span className="text-body-sm text-text-muted">Janeiro 2026</span>
              </div>

              <h3 className="text-display-md text-text mb-4">
                Relatório - Janeiro 2026
              </h3>

              <p className="text-body-md text-text-secondary mb-6">
                Análise do cenário da governança fundiária brasileira com foco nos sistemas de cadastro
                territorial e políticas de regularização.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm">
                  Sumário Executivo
                </Button>
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <Tag variant="primary">Relatório</Tag>
                <span className="text-body-sm text-text-muted">Fevereiro 2026</span>
              </div>

              <h3 className="text-display-md text-text mb-4">
                Relatório - Fevereiro 2026
              </h3>

              <p className="text-body-md text-text-secondary mb-6">
                Continuação do monitoramento das políticas de governança de terras com atualizações
                sobre sistemas e normativas.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="sm">
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm">
                  Sumário Executivo
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Technical Notes Section */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Análises Legais/Legislativas"
            title="Notas técnicas e posicionamentos"
          />

          <div className="space-y-4">
            <Card variant="bordered" padding="md" hoverable>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Tag variant="secondary" size="sm">Nota Técnica</Tag>
                  </div>
                  <h4 className="text-body-lg font-semibold text-text">
                    Nota técnica sobre mudanças normativas
                  </h4>
                  <p className="text-body-sm text-text-secondary mt-1">
                    Análise de impactos de alterações regulatórias na governança fundiária
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver nota
                </Button>
              </div>
            </Card>

            <Card variant="bordered" padding="md" hoverable>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Tag variant="subtle" size="sm">Posicionamento</Tag>
                  </div>
                  <h4 className="text-body-lg font-semibold text-text">
                    Posicionamento público do OPGT
                  </h4>
                  <p className="text-body-sm text-text-secondary mt-1">
                    Posicionamento técnico diante de mudanças relevantes
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver posicionamento
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Coming Soon */}
      <section className="section-padding bg-primary">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-display-lg text-white mb-6">
              Mais publicações em breve
            </h2>
            <p className="text-body-lg text-white/80 mb-8">
              O OPGT está em fase inicial. Novos relatórios e notas técnicas serão publicados
              periodicamente.
            </p>
            <Button variant="secondary" size="lg" href="/contato">
              Receber atualizações
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Relatorios;
