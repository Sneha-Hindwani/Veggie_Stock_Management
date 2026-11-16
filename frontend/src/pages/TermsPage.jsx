import { Link } from 'react-router-dom';
import '../styles/terms.css';

export default function TermsPage() {
    return (
        <div className="terms-page-wrapper">
            <div className="terms-header">
                <h1>🥬 VeggieTrack</h1>
                <p>Terms & Conditions | Privacy Policy | Refund Policy</p>
                <Link to="/home">← Back to Home</Link>
            </div>
            <nav className="terms-nav">
                <a href="#terms">📜 Terms</a>
                <a href="#privacy">🔒 Privacy</a>
                <a href="#refund">💰 Refund</a>
            </nav>
            <div className="terms-content">
                <div className="terms-section" id="terms">
                    <h2>📜 Terms & Conditions</h2>
                    <p><strong>Last Updated:</strong> February 2026</p>
                    <h3>1. Acceptance of Terms</h3><p>By accessing and using VeggieTrack, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.</p>
                    <h3>2. Description of Service</h3><p>VeggieTrack provides a web-based vegetable stock management system that allows users to track inventory, monitor shelf life, record sales, and view analytics for their fresh produce business.</p>
                    <h3>3. User Accounts</h3><ul><li>You are responsible for maintaining the confidentiality of your account credentials.</li><li>You must provide accurate information when creating an account.</li><li>You are responsible for all activities that occur under your account.</li><li>You must notify us immediately of any unauthorized use of your account.</li></ul>
                    <h3>4. Data Storage</h3><p>VeggieTrack currently stores data locally in your browser's localStorage. We recommend regularly exporting your data as backup. We are not responsible for data loss due to browser cache clearing or local storage limitations.</p>
                    <h3>5. Acceptable Use</h3><p>You agree not to misuse the service. This includes but is not limited to: attempting to access other users' data, reverse-engineering the software, or using the service for illegal purposes.</p>
                    <h3>6. Limitation of Liability</h3><p>VeggieTrack is provided "as is" without warranty of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
                </div>
                <div className="terms-section" id="privacy">
                    <h2>🔒 Privacy Policy</h2>
                    <p><strong>Last Updated:</strong> February 2026</p>
                    <h3>1. Data Collection</h3><p>VeggieTrack collects minimal data necessary for the functioning of the service:</p><ul><li>Username (for account identification)</li><li>Inventory data (products, quantities, shelf life, sales records)</li></ul>
                    <h3>2. Data Privacy</h3><p>We take your privacy seriously:</p><ul><li>Admin users can only see aggregated statistics (total users, total inventory size).</li><li>No personal inventory data of any user is shared with anyone, including administrators.</li><li>We do not sell or share your data with third parties.</li></ul>
                    <h3>3. Data Storage</h3><p>All data is stored locally on your browser. No data is transmitted to external servers in the current version of VeggieTrack.</p>
                    <h3>4. Cookies</h3><p>VeggieTrack uses sessionStorage for authentication purposes only. No tracking cookies are used.</p>
                </div>
                <div className="terms-section" id="refund">
                    <h2>💰 Refund Policy</h2>
                    <p><strong>Last Updated:</strong> February 2026</p>
                    <h3>1. Free Plan</h3><p>The Free plan is available at no cost. No refunds are applicable.</p>
                    <h3>2. Paid Plans</h3><p>For Pro and Enterprise plans, we offer a 30-day money-back guarantee. If you are not satisfied with the service, you may request a full refund within 30 days of your initial purchase.</p>
                    <h3>3. How to Request a Refund</h3><p>To request a refund, contact us at <strong>support@veggietrack.com</strong> with your account details and reason for the refund request.</p>
                </div>
            </div>
            <div className="terms-footer"><p>&copy; 2026 VeggieTrack. All rights reserved.</p></div>
        </div>
    );
}
