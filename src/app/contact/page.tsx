
'use client';

import { useState, useEffect } from 'react';
import { Send, RefreshCw, Loader2, ArrowLeft, Mail, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [captchaSvg, setCaptchaSvg] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        captcha: ''
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const fetchCaptcha = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/captcha');
            const data = await res.json();
            setCaptchaSvg(data.svg);
        } catch (error) {
            console.error('Failed to fetch captcha', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setStatus({ type: null, message: '' });

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
                setFormData({ name: '', email: '', message: '', captcha: '' });
                fetchCaptcha(); // Refresh captcha
            } else {
                setStatus({ type: 'error', message: data.error || 'Something went wrong.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12 px-4 flex flex-col items-center justify-center">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
                        <p className="text-gray-400">Have questions? We'd love to hear from you.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <User size={16} /> Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                placeholder="Your Name"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MessageSquare size={16} /> Message
                            </label>
                            <textarea
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={4}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                placeholder="How can we help you?"
                            />
                        </div>

                        {/* Captcha */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Security Check</label>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div
                                    className="bg-white rounded h-12 flex items-center justify-center overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                />
                                <button
                                    type="button"
                                    onClick={fetchCaptcha}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Refresh Captcha"
                                >
                                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.captcha}
                                onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                placeholder="Enter the characters above"
                            />
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <div className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {status.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
