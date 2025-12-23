import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black/80 border-t border-white/10 py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
                <p className="text-gray-400">
                    Copyright © Anshuman Abhishek - 2021{' '}
                    <span className="text-red-500">Made with ❤️</span>
                </p>
            </div>
        </footer>
    );
}
