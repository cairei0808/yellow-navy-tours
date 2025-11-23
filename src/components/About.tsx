import { Award, Users, BookOpen, Sparkles } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Award,
      title: "Award-Winning Education",
      description: "Recognized for excellence in academic achievement and student development.",
    },
    {
      icon: Users,
      title: "Expert Faculty",
      description: "Dedicated teachers with years of experience and passion for education.",
    },
    {
      icon: BookOpen,
      title: "K-12 Curriculum",
      description: "Junior High School (Grades 7-10) and Senior High School (Grades 11-12) programs aligned with DepEd K-12 standards.",
    },
    {
      icon: Sparkles,
      title: "Holistic Development",
      description: "Focus on academics, sports, arts, and character building.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Why Choose FABINHS?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Providing quality education for Junior High School and Senior High School students through the K-12 Philippine curriculum.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-accent flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
