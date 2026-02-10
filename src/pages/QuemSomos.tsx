import React from 'react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * Quem Somos Page - Based on architecture document
 * Function: legitimidade + governança
 */
const QuemSomos: React.FC = () => {
  const howWeWork = [
    {
      title: 'Monitoramento contínuo',
      description: 'Acompanhamento sistemático de políticas, sistemas e instrumentos fundiários'
    },
    {
      title: 'Relatórios e notas técnicas',
      description: 'Elaboração de análises periódicas e posicionamentos fundamentados'
    },
    {
      title: 'Posicionamentos públicos',
      description: 'Publicação de posicionamentos técnicos diante de mudanças relevantes'
    },
    {
      title: 'Interação institucional',
      description: 'Diálogo com órgãos governamentais, especialistas e organizações da sociedade civil'
    },
    {
      title: 'Divulgação de dados',
      description: 'Publicação de dados, análises e conteúdos informativos para o público em geral'
    }
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-text mb-6">
              Quem Somos
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Conheça o Observatório das Políticas de Governança de Terras
            </p>
          </div>
        </Container>
      </section>

      {/* O que é o OPGT */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Sobre"
            title="O que é o OPGT"
          />

          <div className="max-w-4xl space-y-6">
            <p className="text-body-lg text-text leading-relaxed">
              Criado em 2025, o Observatório das Políticas de Governança de Terras é um{' '}
              <strong className="text-primary">coletivo técnico e acadêmico</strong>, formado por
              pesquisadores, profissionais especializados e organizações da sociedade civil, com
              atuação reconhecida nas áreas de governança fundiária, cadastro territorial, direito,
              geotecnologias e políticas públicas.
            </p>

            <p className="text-body-lg text-text-secondary leading-relaxed">
              O Observatório surge a partir da experiência acumulada do{' '}
              <strong>Grupo de Monitoramento de Políticas de Governança de Terras (GMPGT)</strong>{' '}
              e se consolida como um espaço permanente de acompanhamento das políticas fundiárias no Brasil.
            </p>
          </div>
        </Container>
      </section>

      {/* Missão */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Propósito"
            title="Missão"
          />

          <Card variant="elevated" padding="lg" className="max-w-4xl">
            <p className="text-body-lg text-text leading-relaxed">
              Ser uma <strong className="text-primary">referência nacional no monitoramento das políticas
              públicas de governança de terras</strong>, centralizando e publicizando informações de interesse
              público de forma clara, técnica e transparente.
            </p>
          </Card>
        </Container>
      </section>

      {/* Como funciona */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader
            label="Funcionamento"
            title="Como o Observatório funciona"
            description="O OPGT atua por meio de diferentes frentes de trabalho, valorizando a diversidade institucional e a colaboração técnica."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {howWeWork.map((item, index) => (
              <Card key={index} variant="default">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <span className="text-display-sm font-bold">{index + 1}</span>
                </div>
                <h3 className="text-display-sm text-text mb-2">
                  {item.title}
                </h3>
                <p className="text-body-md text-text-secondary">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          <Card variant="ghost" padding="lg" className="border-l-4 border-primary">
            <p className="text-body-lg text-text-secondary italic">
              O Observatório se organiza como <strong className="text-text">uma rede</strong>, valorizando
              a diversidade institucional e a colaboração técnica.
            </p>
          </Card>
        </Container>
      </section>

      {/* Estrutura de Governança */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Governança"
            title="Rede de membros e instituições"
            description="Pesquisadores e profissionais que compõem o observatório"
          />

          <div className="mb-12">
            <h3 className="text-body-lg font-semibold text-text mb-6">Parceiros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Artur Caldas Brandão',
                'Brenda Brito',
                'Cristina Leme Lopes',
                'Regis Bueno',
                'Suzana Daniela Rocha Santos e Silva'
              ].map((name, index) => (
                <Card key={index} variant="default" padding="md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <span className="text-body-md font-medium text-text">{name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-body-lg font-semibold text-text mb-6">Instituições Parceiras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['Imazon', 'Observatório do Código Florestal', 'IGPP'].map((inst, index) => (
                <Card key={index} variant="bordered" padding="lg" className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-display-sm text-primary font-bold">
                      {inst.split(' ').map(w => w[0]).join('').slice(0, 3)}
                    </span>
                  </div>
                  <h4 className="text-body-lg font-semibold text-text">{inst}</h4>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-body-lg font-semibold text-text mb-6">Instituições Mantenedoras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: 'Land Facility', role: 'Financiamento' },
                { name: 'IGT', role: 'Coordenação' }
              ].map((inst, index) => (
                <Card key={index} variant="elevated" padding="lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <span className="text-display-sm text-secondary font-bold">
                        {inst.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-body-lg font-semibold text-text">{inst.name}</h4>
                      <p className="text-body-sm text-text-secondary">{inst.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default QuemSomos;
