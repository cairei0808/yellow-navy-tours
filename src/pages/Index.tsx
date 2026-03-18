import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import KioskSystem from "@/components/KioskSystem";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <KioskSystem />
      <Footer />
    </div>
  );
};

export default Index;
