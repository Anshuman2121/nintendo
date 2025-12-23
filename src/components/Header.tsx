'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { href: '#nesCardContainer', label: 'NES Games' },
    { href: '#snesCardContainer', label: 'SNES Games' },
    { href: '#n64CardContainer', label: 'N64 Games' },
    { href: '#sega', label: 'SEGA Games' },
    { href: '#psx', label: 'PlayStation' },
    { href: '#dosbox', label: 'DOS Games' },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;

            for (const link of navLinks) {
                const id = link.href.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const id = href.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            const top = element.offsetTop - 100;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b-2 border-purple-500 shadow-[0_2px_20px_rgba(139,92,246,0.3)]">
            <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                        Nintendo World!
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden
                    ${activeSection === link.href.replace('#', '')
                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                                            : 'text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                                        }`}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-white hover:text-cyan-400 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        <ul className="flex flex-col space-y-2">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        onClick={(e) => handleNavClick(e, link.href)}
                                        className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${activeSection === link.href.replace('#', '')
                                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                                : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
}
