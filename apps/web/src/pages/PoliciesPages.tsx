import React, { useState } from 'react';
import { Truck, RotateCcw, HelpCircle, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">Policies</span>
        <h1 className="font-serif text-3xl font-bold text-brand-text mt-1">Shipping & Delivery</h1>
        <p className="text-xs text-brand-secondary mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6 text-xs text-brand-text/90 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-brand-text">Three Flexible Delivery Modes</h3>
          <p>
            At Vaish&Co., we understand that every shopping need has a different tempo. We offer three dedicated fulfillment speeds:
          </p>
          <ul className="list-disc pl-5 space-y-2 pt-1 text-brand-secondary">
            <li>
              <strong className="text-brand-text">Mode A: Quick Delivery (15–45 minutes)</strong> — Handled via nearby dark-store fulfillment hubs for emergency skincare, fresh pantry items, and daily essentials. Available in supported city pin codes. Flat ₹49 fee.
            </li>
            <li>
              <strong className="text-brand-text">Mode B: Fast Delivery (1–2 Days)</strong> — Air and expedited surface courier guaranteeing delivery within 24 to 48 hours. Free on orders above ₹999; otherwise ₹79.
            </li>
            <li>
              <strong className="text-brand-text">Mode C: Standard Delivery (3–5 Days)</strong> — Reliable and eco-conscious national shipping. Free on orders above ₹499; otherwise ₹49.
            </li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-brand-border/60">
          <h3 className="font-serif font-bold text-base text-brand-text">Order Tracking</h3>
          <p>
            Upon placing an order, live tracking milestones are available immediately in your{' '}
            <strong>My Orders</strong> portal. You will receive notifications at Confirmed, Packed, Shipped, and Out for Delivery stages.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">Policies</span>
        <h1 className="font-serif text-3xl font-bold text-brand-text mt-1">Returns & Cancellation</h1>
        <p className="text-xs text-brand-secondary mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6 text-xs text-brand-text/90 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base text-brand-text">7-Day Hassle-Free Returns</h3>
          <p>
            We take great pride in our curation. If a product does not delight you, you may request a return within 7 calendar days of receipt, provided:
          </p>
          <ul className="list-disc pl-5 space-y-1 pt-1 text-brand-secondary">
            <li>The item is unwashed, unused, and in its original signature Vaish&Co. packaging.</li>
            <li>Beauty, skincare, and perishable grocery goods must have intact tamper-evident hygiene seals.</li>
            <li>Electronics must include all accessories, manuals, and serial warranty cards.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-brand-border/60">
          <h3 className="font-serif font-bold text-base text-brand-text">Instant Cancellation & Refunds</h3>
          <p>
            Orders can be cancelled with one click while in <em>Confirmed</em> or <em>Processing</em> status before dispatch. For cancelled orders, payments are credited back to the original source, and any Vaish Coins spent are automatically restored to your Rewards Wallet.
          </p>
        </section>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'How do Vaish Coins work?',
      a: 'You earn 1 Vaish Coin for every ₹100 of eligible completed purchases. Each coin is worth ₹0.50 in direct discount. You can apply your coins to pay up to 20% of your cart total at checkout!',
    },
    {
      q: 'Can I choose different delivery speeds for different items?',
      a: 'Yes! Items eligible for Quick Delivery can be purchased separately for 30-minute arrival, or bundled together for standard consolidated shipping.',
    },
    {
      q: 'Who is Vee?',
      a: 'Vee is our friendly AI shopping stylist located in the bottom-right corner of your screen. Vee helps you find gifts, check ingredients, verify delivery times, and compare products grounded strictly in our real catalogue.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards (Visa, MasterCard, RuPay), NetBanking, and Cash on Delivery.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">Help Center</span>
        <h1 className="font-serif text-3xl font-bold text-brand-text mt-1">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-xs space-y-2">
            <h3 className="font-serif font-bold text-sm text-brand-text">{faq.q}</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SupportPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">Get in Touch</span>
        <h1 className="font-serif text-3xl font-bold text-brand-text mt-1">Customer Support</h1>
        <p className="text-xs text-brand-secondary mt-1">
          Our team is here 7 days a week to ensure every find brings you joy.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6">
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-brand-text">Ticket Created</h3>
            <p className="text-xs text-brand-secondary max-w-sm mx-auto">
              Thank you {name}. We have received your inquiry and our support team will respond to {email} within 2 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-brand-text block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vaishali K."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>
              <div>
                <label className="font-bold text-brand-text block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vaishali@example.com"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-brand-text block mb-1">Subject / Order ID</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Question about Order or Delivery"
                className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
              />
            </div>

            <div>
              <label className="font-bold text-brand-text block mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our care specialists assist you?"
                className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-xs transition-all shadow-subtle flex items-center gap-2"
            >
              <span>Submit Ticket</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
