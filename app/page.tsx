import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Motivation from "@/components/Motivation";
import Timetable from "@/components/Timetable";
import Partners from "@/components/Partners";
import FAQ from "@/components/FAQ";
import FooterCTA from "@/components/FooterCTA";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Motivation />
        <Timetable />
        <Partners />
        <FAQ />
        <FooterCTA />
      </main>
    </>
  );
}
