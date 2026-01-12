import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Ana P., Designer Gráfica",
    highlight: "De 'cemitério de ideias' para projetos entregues no prazo.",
    quote: "Eu costumava chamar o Notion de 'cemitério de ideias'. Começava 10 projetos e não terminava nenhum. O NeuroExecução mudou o jogo para mim. Os ciclos de 3 dias me forçam a ser realista e o painel 'Onde Parei' é como ter um assistente para minha memória de trabalho. Pela primeira vez, estou entregando projetos no prazo e sem a ansiedade de antes.",
    image: "/images/ana-p.jpg", // Placeholder image
  },
  {
    name: "Lucas M., Estudante de Engenharia",
    highlight: "Minhas notas melhoraram e minha ansiedade diminuiu 80%.",
    quote: "A 'paralisia do TDAH' antes de uma prova era meu maior inimigo. Eu sabia o que tinha que fazer, mas simplesmente não conseguia começar. A IA do NeuroExecução que quebra as tarefas para mim foi um divisor de águas. Ver 'Estudar Capítulo 3' virar 'A: Ler as primeiras 5 páginas' torna tudo possível. Minhas notas melhoraram e minha ansiedade diminuiu 80%.",
    image: "/images/lucas-m.jpg", // Placeholder image
  },
  {
    name: "Carla S., Gerente de Projetos",
    highlight: "É a primeira ferramenta que realmente entende como minha mente funciona.",
    quote: "Eu vivo em reuniões. Lembrar de tudo era impossível e a 'taxa do TDAH' estava me custando caro, literal e figurativamente. O NeuroExecução se tornou meu segundo cérebro. O Jardim do Foco me dá a pequena recompensa de dopamina que eu preciso para manter a consistência, e o sistema de ciclos me ajuda a delegar e acompanhar minha equipe de forma muito mais clara. É a primeira ferramenta que realmente entende como minha mente funciona.",
    image: "/images/carla-s.jpg", // Placeholder image
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          Você não está sozinho.
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
          Veja o que dizem mentes como a sua.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8">
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-green-600 font-medium">{testimonial.highlight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
