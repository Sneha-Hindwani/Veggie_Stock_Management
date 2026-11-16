import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const testimonials = [
    { img: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Rajesh Sharma', role: 'Fresh Market Owner, Delhi', text: '"VeggieTrack has transformed how I manage my vegetable shop. The shelf life tracking alone has saved me from throwing away expired produce. Highly recommended!"' },
    { img: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Priya Kulkarni', role: 'Organic Farm Store, Pune', text: '"The dashboard gives me a clear picture of what\'s selling and what\'s about to expire. I\'ve reduced waste by 25% in just two months. Simply amazing!"' },
    { img: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'Amit Kumar', role: 'Wholesale Vendor, Mumbai', text: '"Easy to use, beautiful interface, and the expiry alerts are a lifesaver. My team picks it up instantly. Best inventory tool for fresh produce businesses."' },
    { img: 'https://randomuser.me/api/portraits/women/55.jpg', name: 'Sunita Patel', role: 'Restaurant Owner, Bangalore', text: '"Since using VeggieTrack, our restaurant has cut food costs by 20%. The real-time inventory updates help us order smarter and waste less. A must-have for any food business!"' },
    { img: 'https://randomuser.me/api/portraits/men/75.jpg', name: 'Vikram Singh', role: 'Supermarket Chain Manager, Chennai', text: '"Managing multiple store locations was a nightmare before VeggieTrack. Now I can monitor all inventory from one dashboard. The analytics helped us optimize our supply chain significantly."' },
];

export default function HomePage() {
    const [scrolled, setScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideInterval = useRef(null);
    const slideCount = testimonials.length;

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-play carousel
    useEffect(() => {
        slideInterval.current = setInterval(() => setCurrentSlide(c => (c + 1) % slideCount), 4000);
        return () => clearInterval(slideInterval.current);
    }, [slideCount]);

    const pauseCarousel = () => clearInterval(slideInterval.current);
    const resumeCarousel = () => { slideInterval.current = setInterval(() => setCurrentSlide(c => (c + 1) % slideCount), 4000); };

    const getPositionClass = (index) => {
        let diff = index - currentSlide;
        if (diff > Math.floor(slideCount / 2)) diff -= slideCount;
        else if (diff < -Math.floor(slideCount / 2)) diff += slideCount;
        if (diff === 0) return 'position-center';
        if (diff === -1) return 'position-left';
        if (diff === 1) return 'position-right';
        if (diff < -1) return 'position-far-left';
        return 'position-far-right';
    };

    // Intersection observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('animate-in'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.feature-card, .plan-card, .testimonial-card, .contact-item').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const smoothScroll = (e, targetId) => {
        e.preventDefault();
        const el = document.querySelector(targetId);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMobileMenuOpen(false); }
    };

    const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', rating: '0', message: '' });
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your feedback! We appreciate it. 🌿');
        setFeedbackForm({ name: '', email: '', rating: '0', message: '' });
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert('Message sent successfully! We will get back to you within 24 hours. 📧');
        setContactForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="homepage-wrapper">
            {/* NAVBAR */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
                <div className="nav-container">
                    <a href="#" className="nav-logo" onClick={e => smoothScroll(e, '#hero')}>🥬 VeggieTrack</a>
                    <ul className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
                        <li><a href="#about" onClick={e => smoothScroll(e, '#about')}>About</a></li>
                        <li><a href="#plans" onClick={e => smoothScroll(e, '#plans')}>Plans</a></li>
                        <li><a href="#testimonials" onClick={e => smoothScroll(e, '#testimonials')}>Testimonials</a></li>
                        <li><a href="#contact" onClick={e => smoothScroll(e, '#contact')}>Contact</a></li>
                    </ul>
                    <div className="nav-actions">
                        <Link to="/login?mode=login" className="nav-btn nav-btn-outline">Login</Link>
                        <Link to="/login?mode=signup" className="nav-btn nav-btn-filled">Sign Up</Link>
                    </div>
                    <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero" id="hero">
                <div className="hero-bg"><div className="hero-gradient"></div></div>
                <div className="hero-content">
                    <span className="hero-badge">🌿 #1 Vegetable Stock Management</span>
                    <h1 className="hero-title">Keep Your <span className="text-gradient">Produce Fresh</span>,<br />Your Business <span className="text-gradient">Thriving</span></h1>
                    <p className="hero-description">Track shelf life, manage stock levels, and reduce waste with our intelligent vegetable inventory system. Built for vendors, markets, and fresh produce businesses.</p>
                    <div className="hero-actions">
                        <Link to="/" className="btn btn-hero-primary">Get Started Free →</Link>
                        <a href="#about" className="btn btn-hero-secondary" onClick={e => smoothScroll(e, '#about')}>Learn More</a>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat"><span className="hero-stat-number">500+</span><span className="hero-stat-label">Active Users</span></div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat"><span className="hero-stat-number">50K+</span><span className="hero-stat-label">Items Tracked</span></div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat"><span className="hero-stat-number">30%</span><span className="hero-stat-label">Less Waste</span></div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="section about-section" id="about">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">About Us</span>
                        <h2 className="section-title">Why Choose <span className="text-gradient">VeggieTrack</span>?</h2>
                        <p className="section-subtitle">We're on a mission to reduce food waste and help fresh produce businesses thrive through smart inventory management.</p>
                    </div>
                    <div className="feature-grid">
                        {[
                            { icon: '🕐', title: 'Shelf Life Tracking', desc: 'Real-time tracking of remaining shelf life for every item. Get alerts before produce expires.' },
                            { icon: '📊', title: 'Smart Analytics', desc: 'Insights into sales patterns and stock levels to optimize ordering and reduce waste.' },
                            { icon: '⚡', title: 'Lightning Fast', desc: 'Instant updates and real-time inventory management. No delays, no downtime.' },
                            { icon: '🔒', title: 'Secure & Private', desc: "Your data stays private. We never share individual inventory details — guaranteed." },
                            { icon: '📱', title: 'Responsive Design', desc: 'Access your dashboard from any device — desktop, tablet, or mobile phone.' },
                            { icon: '🌱', title: 'Eco-Friendly', desc: 'Reduce food waste by up to 30% with proactive expiry management and smart alerts.' },
                        ].map((f, i) => (
                            <div className="feature-card" key={i}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLANS */}
            <section className="section plans-section" id="plans">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Pricing</span>
                        <h2 className="section-title">Choose Your <span className="text-gradient">Plan</span></h2>
                        <p className="section-subtitle">Start free, upgrade as you grow. No hidden fees, cancel anytime.</p>
                    </div>
                    <div className="plans-grid">
                        <div className="plan-card">
                            <div className="plan-header"><h3 className="plan-name">Free</h3><div className="plan-price"><span className="plan-currency">₹</span><span className="plan-amount">0</span><span className="plan-period">/month</span></div><p className="plan-desc">Perfect for getting started</p></div>
                            <ul className="plan-features"><li>✅ Up to 50 products</li><li>✅ Shelf life tracking</li><li>✅ Basic dashboard</li><li>✅ Sales recording</li><li>❌ Advanced analytics</li><li>❌ Priority support</li></ul>
                            <Link to="/" className="btn btn-plan">Get Started</Link>
                        </div>
                        <div className="plan-card plan-popular">
                            <div className="plan-badge">Most Popular</div>
                            <div className="plan-header"><h3 className="plan-name">Pro</h3><div className="plan-price"><span className="plan-currency">₹</span><span className="plan-amount">299</span><span className="plan-period">/month</span></div><p className="plan-desc">For growing businesses</p></div>
                            <ul className="plan-features"><li>✅ Unlimited products</li><li>✅ Shelf life tracking</li><li>✅ Advanced dashboard</li><li>✅ Sales analytics</li><li>✅ Advanced analytics</li><li>❌ Dedicated support</li></ul>
                            <Link to="/" className="btn btn-plan btn-plan-primary">Get Started</Link>
                        </div>
                        <div className="plan-card">
                            <div className="plan-header"><h3 className="plan-name">Enterprise</h3><div className="plan-price"><span className="plan-currency">₹</span><span className="plan-amount">699</span><span className="plan-period">/month</span></div><p className="plan-desc">For large operations</p></div>
                            <ul className="plan-features"><li>✅ Unlimited everything</li><li>✅ Multi-user access</li><li>✅ Custom reports</li><li>✅ API access</li><li>✅ Advanced analytics</li><li>✅ 24/7 dedicated support</li></ul>
                            <Link to="/" className="btn btn-plan">Contact Sales</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section testimonials-section" id="testimonials">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Testimonials</span>
                        <h2 className="section-title">What Our <span className="text-gradient">Users Say</span></h2>
                        <p className="section-subtitle">Join hundreds of happy vendors and businesses already using VeggieTrack.</p>
                    </div>
                    <div className="testimonial-slider-container" onMouseEnter={pauseCarousel} onMouseLeave={resumeCarousel}>
                        <button className="slider-btn prev-btn" onClick={() => setCurrentSlide(c => (c - 1 + slideCount) % slideCount)} aria-label="Previous Slide">❮</button>
                        <div className="testimonial-track">
                            {testimonials.map((t, i) => (
                                <div key={i} className={`testimonial-card ${getPositionClass(i)}`} onClick={() => { const pos = getPositionClass(i); if (pos === 'position-left') setCurrentSlide(c => (c - 1 + slideCount) % slideCount); else if (pos === 'position-right') setCurrentSlide(c => (c + 1) % slideCount); }}>
                                    <div className="testimonial-content">
                                        <img src={t.img} alt={t.name} className="testimonial-img" />
                                        <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                                        <p className="testimonial-text">{t.text}</p>
                                        <div className="testimonial-author"><h4>{t.name}</h4><span className="testimonial-role">{t.role}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="slider-btn next-btn" onClick={() => setCurrentSlide(c => (c + 1) % slideCount)} aria-label="Next Slide">❯</button>
                        <div className="testimonial-controls">
                            <div className="slider-dots">
                                {testimonials.map((_, i) => (<div key={i} className={`slider-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></div>))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEEDBACK */}
            <section className="section feedback-section" id="feedback">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Feedback</span>
                        <h2 className="section-title">Share Your <span className="text-gradient">Thoughts</span></h2>
                        <p className="section-subtitle">We're always improving. Let us know how we can serve you better.</p>
                    </div>
                    <div className="feedback-grid">
                        <div className="feedback-form-container">
                            <div className="feedback-card image-only">
                                <div className="feedback-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=500&fit=crop')" }}></div>
                            </div>
                        </div>
                        <div className="feedback-form-container">
                            <div className="feedback-card form-only">
                                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                                    <div className="form-row"><div className="form-group"><label>Your Name</label><input type="text" placeholder="John Doe" value={feedbackForm.name} onChange={e => setFeedbackForm({ ...feedbackForm, name: e.target.value })} required /></div><div className="form-group"><label>Email Address</label><input type="email" placeholder="john@example.com" value={feedbackForm.email} onChange={e => setFeedbackForm({ ...feedbackForm, email: e.target.value })} required /></div></div>
                                    <div className="form-group"><label>Rating</label><select value={feedbackForm.rating} onChange={e => setFeedbackForm({ ...feedbackForm, rating: e.target.value })} required><option value="0">Select Rating</option><option value="5">⭐⭐⭐⭐⭐ Excellent</option><option value="4">⭐⭐⭐⭐ Good</option><option value="3">⭐⭐⭐ Average</option><option value="2">⭐⭐ Below Average</option><option value="1">⭐ Poor</option></select></div>
                                    <div className="form-group"><label>Your Feedback</label><textarea rows="4" placeholder="Tell us what you think..." value={feedbackForm.message} onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })} required></textarea></div>
                                    <button type="submit" className="btn btn-submit">Submit Feedback</button>
                                </form>
                            </div>
                        </div>
                        <div className="feedback-form-container">
                            <div className="feedback-card placeholder">
                                <img src="https://imgs.search.brave.com/Rr8ZjKgmYbxiy5pCk3Tj2t2EcTHwuZGRum9zlnAZlXc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTE0/MDAwNDA3Ny9waG90/by9mYXJtZXJzLXVu/bG9hZGluZy1jcmF0/ZXMtb2Ytb3JnYW5p/Yy10b21hdG9lcy1v/dXRzaWRlLWdyb2Nl/cnktc3RvcmUuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPS1k/MWJSTTR0c0VMMHAx/TlJXSTdEemZ4ZnZr/VDFVWUFENENHU0VM/NjRYLVE9" alt="Vegetable seller" className="feedback-right-image" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section className="section contact-section" id="contact">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Contact</span>
                        <h2 className="section-title">Get In <span className="text-gradient">Touch</span></h2>
                        <p className="section-subtitle">Have questions? We'd love to hear from you. Reach out and we'll get back within 24 hours.</p>
                    </div>
                    <div className="contact-grid">
                        <div className="contact-info">
                            <div className="contact-item"><div className="contact-icon">📧</div><div><h4>Email Us</h4><p>support@veggietrack.com</p></div></div>
                            <div className="contact-item"><div className="contact-icon">📞</div><div><h4>Call Us</h4><p>+91 98765 43210</p></div></div>
                            <div className="contact-item"><div className="contact-icon">📍</div><div><h4>Visit Us</h4><p>123 Green Market Road, Mumbai, India</p></div></div>
                            <div className="contact-item"><div className="contact-icon">⏰</div><div><h4>Business Hours</h4><p>Mon - Sat: 9:00 AM - 6:00 PM</p></div></div>
                        </div>
                        <form className="contact-form" onSubmit={handleContactSubmit}>
                            <div className="form-row"><div className="form-group"><label>Name</label><input type="text" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required /></div><div className="form-group"><label>Email</label><input type="email" placeholder="your@email.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required /></div></div>
                            <div className="form-group"><label>Subject</label><input type="text" placeholder="How can we help?" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} required /></div>
                            <div className="form-group"><label>Message</label><textarea rows="4" placeholder="Your message..." value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required></textarea></div>
                            <button type="submit" className="btn btn-submit">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* SCROLL TO TOP */}
            <button className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">↑</button>

            {/* FOOTER */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand"><h3>🥬 VeggieTrack</h3><p>Smart vegetable stock management for modern businesses. Track freshness, reduce waste, grow profits.</p></div>
                        <div className="footer-links"><h4>Quick Links</h4><ul><li><a href="#about" onClick={e => smoothScroll(e, '#about')}>About Us</a></li><li><a href="#plans" onClick={e => smoothScroll(e, '#plans')}>Pricing</a></li><li><a href="#testimonials" onClick={e => smoothScroll(e, '#testimonials')}>Testimonials</a></li><li><a href="#contact" onClick={e => smoothScroll(e, '#contact')}>Contact</a></li></ul></div>
                        <div className="footer-links"><h4>Legal</h4><ul><li><Link to="/terms">Terms & Conditions</Link></li><li><Link to="/terms#privacy">Privacy Policy</Link></li><li><Link to="/terms#refund">Refund Policy</Link></li></ul></div>
                        <div className="footer-links"><h4>Connect</h4><ul><li><a href="#">Twitter / X</a></li><li><a href="#">LinkedIn</a></li><li><a href="#">Instagram</a></li><li><a href="#">GitHub</a></li></ul></div>
                        <div className="footer-subscribe"><h4>Newsletter</h4><p>Stay updated with our latest news and offers.</p><div className="subscribe-form"><input type="email" placeholder="Enter your email" /><button className="btn btn-subscribe" onClick={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>Subscribe</button></div></div>
                    </div>
                    <div className="footer-bottom"><p>&copy; 2026 VeggieTrack. All rights reserved. Made with 💚 for fresh produce businesses.</p></div>
                </div>
            </footer>
        </div>
    );
}
