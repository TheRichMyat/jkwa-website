import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import DesignerQuotes from "@/components/home/DesignerQuotes";
import Hero from "@/components/home/Hero";
import Portfolio from "@/components/home/Portfolio";
import Services from "@/components/home/Services";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <DesignerQuotes />
      <Services />
      <Portfolio />
      <Contact />
    </>
  );
}
