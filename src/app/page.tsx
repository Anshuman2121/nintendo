import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameSection from '@/components/GameSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <ParticleBackground />
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Nintendo World!
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 my-8">
            <Link
              href="/load"
              className="px-6 py-3 bg-purple-500/20 border border-purple-500/40 rounded-lg text-cyan-400 font-bold hover:bg-purple-500/30 hover:text-green-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,212,255,0.5)]"
            >
              Run your own ROM!
            </Link>
          </div>

          {/* Quote */}
          <p className="text-green-400 italic text-lg max-w-2xl mx-auto px-4 drop-shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            &quot;For young players, classic games are brand new. For older players, they bring back memories and make you feel good&quot;
          </p>
        </section>

        {/* Game Sections */}
        <GameSection title="NES Games" csvFile="nes.csv" id="nesCardContainer" />
        <GameSection title="SNES Games" csvFile="snes.csv" id="snesCardContainer" />
        <GameSection title="N64 Games" csvFile="n64.csv" id="n64CardContainer" />
        <GameSection title="SEGA Games" csvFile="sega.csv" id="sega" />
        <GameSection title="PlayStation Games" csvFile="psx.csv" id="psx" />
        <GameSection title="DOS Games" csvFile="dos.csv" id="dosbox" />
      </main>

      <Footer />
    </div>
  );
}
