import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Briefcase, User, BookOpen } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  onSkip: () => void;
}

const categoryIcons = {
  work: Briefcase,
  personal: User,
  creative: BookOpen,
  learning: BookOpen
};

const categoryLabels = {
  work: 'Trabalho',
  personal: 'Pessoal',
  creative: 'Criativo',
  learning: 'Aprendizado'
};

export function TemplateSelector({ onSelectTemplate, onSkip }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const templates = [
    {
      id: 'launch-digital-product',
      title: 'Lançar Produto Digital',
      category: 'work',
      description: 'Do conceito ao MVP em 3 semanas',
      popular: true
    },
    {
      id: 'write-article-report',
      title: 'Escrever Artigo ou Relatório',
      category: 'creative',
      description: 'Estruture e escreva conteúdo completo',
      popular: true
    },
    {
      id: 'organize-event',
      title: 'Organizar Evento',
      category: 'personal',
      description: 'Planeje festa, workshop ou reunião',
      popular: false
    },
    {
      id: 'home-renovation',
      title: 'Reformar Casa ou Cômodo',
      category: 'personal',
      description: 'Gerencie reforma do início ao fim',
      popular: false
    },
    {
      id: 'plan-trip',
      title: 'Planejar Viagem',
      category: 'personal',
      description: 'Organize viagem completa',
      popular: true
    }
  ];

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Comece com um Template</h2>
        <p className="text-muted-foreground">
          Escolha um modelo pronto para começar mais rápido, ou crie do zero
        </p>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = categoryIcons[template.category as keyof typeof categoryIcons];
          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </div>
                  {template.popular && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onSkip}>
          Prefiro criar do zero
        </Button>
      </div>
    </div>
  );
}
