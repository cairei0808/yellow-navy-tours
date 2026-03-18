import { Monitor, Map, Clock, Search } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Monitor,
      title: "Digital Kiosk System",
      description: "An interactive information kiosk designed to help students, staff, and visitors navigate FABINHS with ease.",
    },
    {
      icon: Map,
      title: "Campus Map",
      description: "View a detailed digital campus map showing all buildings, rooms, and facilities across the school grounds.",
    },
    {
      icon: Clock,
      title: "Class Schedules",
      description: "Instantly look up room schedules, sections, advisers, and subjects for every classroom in every building.",
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Search by teacher name, subject, section, or room number to quickly find the information you need.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            About the Kiosk System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The FABINHS Kiosk Information System provides quick access to campus maps, room schedules, and school information — all in one place.
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
