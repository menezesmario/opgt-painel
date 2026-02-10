import React from 'react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * Imprensa Page - Based on architecture document
 * Function: facilitar cobertura e posicionamento público
 */
const Imprensa: React.FC = () => {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-text mb-6">
              Imprensa
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Informação qualificada para cobertura jornalística sobre governança de terras no Brasil.
            </p>
          </div>
        </Container>
      </section>

      {/* What we offer */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Recursos"
            title="O que oferecemos para imprensa"
            description="O OPGT entende a imprensa como parceira estratégica na difusão de informações qualificadas sobre governança territorial."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Releases institucionais', icon: '📄' },
              { title: 'Posicionamentos públicos', icon: '📢' },
              { title: 'Relatórios e notas técnicas', icon: '📊' },
              { title: 'Contato para imprensa', icon: '📞' }
            ].map((item, index) => (
              <Card key={index} variant="default" className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-body-lg font-semibold text-text">
                  {item.title}
                </h3>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Releases */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Comunicação"
            title="Releases e notas"
          />

          <div className="space-y-4">
            <Card variant="elevated" padding="lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Tag variant="primary">Release</Tag>
                    <span className="text-body-sm text-text-muted">Janeiro 2026</span>
                  </div>
                  <h3 className="text-display-sm text-text mb-2">
                    Lançamento do OPGT
                  </h3>
                  <p className="text-body-md text-text-secondary">
                    Observatório das Políticas de Governança de Terras inicia operações com
                    foco em transparência e dados públicos.
                  </p>
                </div>
                <Button variant="primary">
                  Download Release
                </Button>
              </div>
            </Card>

            <Card variant="bordered" padding="md" className="opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag variant="subtle" size="sm">Em breve</Tag>
                  <span className="text-body-md text-text-secondary">Mais releases serão publicados em breve</span>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Press Contact */}
      <section className="section-padding bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SectionHeader
                label="Contato"
                title="Assessoria de Imprensa"
              />

              <Card variant="default" padding="lg">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-body-md font-semibold text-text mb-2">Email para imprensa</h4>
                    <a href="mailto:imprensa@opgt.org.br" className="text-primary hover:text-primary-dark text-body-lg">
                      imprensa@opgt.org.br
                    </a>
                  </div>

                  <div>
                    <h4 className="text-body-md font-semibold text-text mb-2">Porta-voz</h4>
                    <p className="text-body-md text-text-secondary">
                      Para entrevistas e declarações, entre em contato com a coordenação do OPGT.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-body-md font-semibold text-text mb-2">Horário de atendimento</h4>
                    <p className="text-body-md text-text-secondary">
                      Segunda a sexta, das 9h às 18h (horário de Brasília)
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <SectionHeader
                label="Materiais"
                title="Kit de Imprensa"
              />

              <div className="space-y-4">
                <Card variant="bordered" padding="md" hoverable>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="icon-box">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-body-md font-semibold text-text">Logo OPGT</h4>
                        <p className="text-body-sm text-text-secondary">Versões em alta resolução</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </Card>

                <Card variant="bordered" padding="md" hoverable>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="icon-box">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-body-md font-semibold text-text">Apresentação institucional</h4>
                        <p className="text-body-sm text-text-secondary">PDF sobre o OPGT</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Clipping */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Mídia"
            title="Confira o OPGT na Imprensa"
            description="Cobertura jornalística sobre o observatório"
            centered
          />

          <Card variant="bordered" padding="lg" className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-display-sm text-text mb-2">Em breve</h3>
            <p className="text-body-md text-text-secondary">
              O clipping de mídia será disponibilizado à medida que houver cobertura jornalística sobre o OPGT.
            </p>
          </Card>
        </Container>
      </section>
    </main>
  );
};

export default Imprensa;
