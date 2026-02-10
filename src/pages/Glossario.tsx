import React, { useState, useMemo } from 'react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Tag from '../components/ui/Tag';
import SectionHeader from '../components/ui/SectionHeader';
import Select from '../components/ui/Select';
import { glossaryTerms } from '../data/glossary';

/**
 * Glossário Page - Based on architecture document
 * Function: acessibilidade sem perder rigor
 */
const Glossario: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(glossaryTerms.map(t => t.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, []);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Todas as categorias' },
      ...categories
        .filter(c => c !== 'all')
        .map(category => ({
          value: category,
          label: category.charAt(0).toUpperCase() + category.slice(1)
        }))
    ];
  }, [categories]);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: typeof glossaryTerms } = {};
    filteredTerms.forEach(term => {
      const firstLetter = term.term[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-display-xl text-text mb-6">
              Glossário
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Conceitos-chave da governança de terras. Definições claras e contextualizadas sobre
              termos técnicos utilizados ao longo do site, dos relatórios e do dashboard.
            </p>
          </div>
        </Container>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b border-border sticky top-20 z-40">
        <Container>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar termo ou definição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                           text-body-md"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categoryOptions}
              />
            </div>
          </div>

          <p className="mt-4 text-body-sm text-text-muted">
            {filteredTerms.length} {filteredTerms.length === 1 ? 'termo encontrado' : 'termos encontrados'}
          </p>
        </Container>
      </section>

      {/* Alphabet Navigation */}
      <section className="py-4 bg-bg-alt border-b border-border">
        <Container>
          <div className="flex flex-wrap gap-1 justify-center">
            {alphabet.map(letter => {
              const hasTerms = groupedTerms[letter] && groupedTerms[letter].length > 0;
              return (
                <a
                  key={letter}
                  href={hasTerms ? `#letter-${letter}` : undefined}
                  className={`
                    w-9 h-9 flex items-center justify-center rounded font-medium text-body-sm
                    transition-all duration-200
                    ${hasTerms
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-border/50 text-text-muted cursor-not-allowed'
                    }
                  `}
                  onClick={(e) => { if (!hasTerms) e.preventDefault(); }}
                >
                  {letter}
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Terms */}
      <section className="section-padding bg-white">
        <Container>
          {Object.keys(groupedTerms).length > 0 ? (
            <div className="space-y-16">
              {Object.keys(groupedTerms).sort().map(letter => (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-40">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-display-xl text-primary font-bold">{letter}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groupedTerms[letter].map((term, index) => (
                      <Card key={index} variant="default" padding="lg">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-display-sm text-text">
                            {term.term}
                          </h3>
                          {term.category && (
                            <Tag variant="subtle" size="sm">
                              {term.category}
                            </Tag>
                          )}
                        </div>
                        <p className="text-body-md text-text-secondary leading-relaxed">
                          {term.definition}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-bg-alt flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-display-sm text-text mb-2">Nenhum termo encontrado</h3>
              <p className="text-body-md text-text-secondary mb-6">
                Tente buscar por outro termo ou remova os filtros.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* About Glossary */}
      <section className="section-padding bg-bg-alt">
        <Container size="narrow">
          <Card variant="default" padding="lg">
            <SectionHeader
              title="Sobre este Glossário"
              className="mb-6"
            />
            <div className="space-y-4 text-body-md text-text-secondary">
              <p>
                Este glossário reúne termos técnicos, jurídicos e institucionais relacionados à
                governança fundiária no Brasil. As definições foram elaboradas pela equipe do OPGT
                com base em legislação, documentos oficiais e literatura especializada.
              </p>
              <p>
                O glossário é atualizado continuamente à medida que novos termos e conceitos surgem
                no contexto das políticas de cadastro territorial e gestão de terras.
              </p>
              <p className="text-body-sm text-text-muted">
                Sugestões de novos termos ou correções podem ser enviadas através do{' '}
                <a href="/contato" className="text-primary hover:text-primary-dark underline">
                  formulário de contato
                </a>.
              </p>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
};

export default Glossario;
