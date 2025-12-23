'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Gamepad2 } from 'lucide-react';
import AuthButton from './AuthButton';

const navLinks = [
    { href: '#nesCardContainer', label: 'NES' },
    { href: '#snesCardContainer', label: 'SNES' },
    { href: '#n64CardContainer', label: 'N64' },
    { href: '#sega', label: 'SEGA' },
    { href: '#psx', label: 'PlayStation' },
    { href: '#dosbox', label: 'DOS' },
];

export default function Header() {
    const pathname = usePathname();
    const isGamePage = pathname?.startsWith('/play');
    const headerRef = useRef<HTMLElement>(null);

    // State for click-based expansion (instead of hover)
    const [isExpanded, setIsExpanded] = useState(false);

    // Derived state: effectively "squeezed" if on game page and NOT expanded
    const isSqueezed = isGamePage && !isExpanded;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [scrolled, setScrolled] = useState(false);

    // Click outside to close
    useEffect(() => {
        if (!isGamePage || !isExpanded) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        // Add listener with a small delay to prevent immediate close
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isGamePage, isExpanded]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            const scrollPosition = window.scrollY + 150;
            // Only check active section if we are on the home page (with hashes)
            if (!isGamePage) {
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
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isGamePage]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();

        // If not on home page, navigate home first
        if (pathname !== '/') {
            window.location.href = '/' + href;
            return;
        }

        const id = href.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            const top = element.offsetTop - 100;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <header
            ref={headerRef}
            onClick={() => {
                // Only toggle if currently squeezed (clicking to expand)
                if (isSqueezed) {
                    setIsExpanded(true);
                }
            }}
            className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSqueezed
                ? 'top-4 left-4 w-14 h-14 bg-black/40 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-purple-500/30 overflow-hidden cursor-pointer hover:bg-black/60'
                : `top-0 left-0 right-0 ${scrolled ? 'bg-black/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(139,92,246,0.3)] border-b border-purple-500/30' : 'bg-transparent'}`
                }`}
        >
            <nav className={`max-w-7xl mx-auto h-full flex items-center ${isSqueezed ? 'justify-center px-0' : 'justify-between px-4 sm:px-6 lg:px-8'}`}>
                {/* Logo */}
                <Link
                    href="/"
                    onClick={(e) => {
                        // Prevent navigation when squeezed - let the header onClick handle expansion
                        if (isSqueezed) {
                            e.preventDefault();
                        }
                    }}
                    className={`flex items-center gap-2 group transition-all duration-300 ${isSqueezed ? 'p-0' : ''}`}
                >
                    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 ${isSqueezed ? 'w-8 h-8 group-hover:shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'w-10 h-10 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]'
                        }`}>
                        <Gamepad2 className={`${isSqueezed ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                    </div>

                    {/* Hide Text when squeezed */}
                    <span
                        className={`text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap overflow-hidden ${isSqueezed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100'
                            }`}
                    >
                        Nintendo World
                    </span>
                </Link>

                {/* Content Container - Fades out when squeezed */}
                <div className={`flex items-center gap-4 transition-all duration-300 ${isSqueezed ? 'w-0 opacity-0 overflow-hidden pointer-events-none' : 'w-auto opacity-100'}`}>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center">
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                                        ${activeSection === link.href.replace('#', '')
                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Auth + Mobile Menu + Close button */}
                    <div className="flex items-center gap-3">
                        <AuthButton />

                        {/* Close button - only show when expanded on game page */}
                        {isGamePage && isExpanded && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(false);
                                }}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden relative p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                                    <Menu size={20} />
                                </span>
                                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                                    <X size={20} />
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Only show if NOT squeezed */}
                <div
                    className={`lg:hidden absolute top-full left-0 right-0 overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen && !isSqueezed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className={`bg-black/90 backdrop-blur-xl border-b border-purple-500/30 ${scrolled ? '' : 'mt-2 rounded-b-2xl border-x'}`}>
                        <div className="py-4 space-y-2 px-4">
                            {navLinks.map((link, index) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform
                                        ${activeSection === link.href.replace('#', '')
                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                            : 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10'
                                        }`}
                                    style={{
                                        transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                                        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                                        opacity: mobileMenuOpen ? 1 : 0,
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bottom gradient line - Hide when squeezed */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-opacity duration-500 ${scrolled && !isSqueezed ? 'opacity-100' : 'opacity-0'}`} />
        </header>
    );
}
