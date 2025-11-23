import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import libraryImage from "@/assets/library.jpg";
import labImage from "@/assets/lab.jpg";
import sportsImage from "@/assets/sports.jpg";
import building360 from "@/assets/building-360.webp";
import Tour360Modal from "./Tour360Modal";

const TourSection = () => {
  const [selectedTour, setSelectedTour] = useState<{ title: string; url?: string; panorama?: string } | null>(null);
  const tourAreas = [
    {
      title: "Buildings",
      description: "Explore our campus buildings featuring modern architecture and facilities designed for optimal learning environments and student comfort.",
      image: libraryImage,
    },
    {
      title: "DCP and Computer Lab",
      description: "State-of-the-art computer laboratories equipped with modern technology where students develop digital skills and technical competencies.",
      image: labImage,
    },
    {
      title: "Gymnasium",
      description: "Our fully-equipped gymnasium provides excellent facilities for sports, physical education, and school events promoting health and teamwork.",
      image: sportsImage,
    },
  ];

  return (
    <section id="tour" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Explore Our Campus
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take a virtual walk through our facilities and see where learning comes to life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tourAreas.map((area, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-strong transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={area.image}
                  alt={area.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-primary-foreground">
                  {area.title}
                </h3>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{area.description}</p>
                <Button 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setSelectedTour({ 
                    title: area.title,
                    panorama: area.title === "Buildings" ? building360 : undefined
                  })}
                >
                  <Eye className="mr-2 w-4 h-4" />
                  View 360° Tour
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tour360Modal
          isOpen={selectedTour !== null}
          onClose={() => setSelectedTour(null)}
          title={selectedTour?.title || ""}
          tourUrl={selectedTour?.url}
          panoramaImage={selectedTour?.panorama}
        />
      </div>
    </section>
  );
};

export default TourSection;
