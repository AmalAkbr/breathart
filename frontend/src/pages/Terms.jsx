import React from "react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using https://breathartinstitute.in/, you confirm that you have read, understood, and agreed to these Terms and Conditions.",
  },
  {
    title: "2. Services",
    content:
      "Educational Institute provides educational content, career-focused training, and related services through its website and connected platforms.",
  },
  {
    title: "3. User Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your account details and for all activities under your account. You agree to provide accurate information when creating an account.",
  },
  {
    title: "4. Acceptable Use",
    content:
      "You agree not to use the Service for unlawful activity, unauthorized system access, abuse, harassment, or any behavior that disrupts our operations or harms other users.",
  },
  {
    title: "5. Intellectual Property",
    content:
      "All content, branding, course materials, and platform assets are owned by Educational Institute or licensed to us. You may not copy, republish, or distribute our materials without written permission.",
  },
  {
    title: "6. Payments and Access",
    content:
      "Where applicable, fees, access periods, and enrollment terms are communicated at the time of purchase or admission. Continued access may depend on compliance with these terms and applicable payment obligations.",
  },
  {
    title: "7. Termination",
    content:
      "We may suspend or terminate access where there is a violation of these Terms, misuse of the Service, or behavior that poses legal or operational risk.",
  },
  {
    title: "8. Disclaimer",
    content:
      "The Service is provided on an 'as is' and 'as available' basis. While we strive for reliability and quality, we do not guarantee uninterrupted availability.",
  },
  {
    title: "9. Limitation of Liability",
    content:
      "To the fullest extent permitted by law, Educational Institute is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the Service.",
  },
  {
    title: "10. Changes to These Terms",
    content:
      "We may update these Terms from time to time. Updated versions will be posted on this page. Continued use after updates means you accept the revised Terms.",
  },
  {
    title: "11. Governing Law",
    content:
      "These Terms are governed by applicable laws of India. Any disputes will be subject to the jurisdiction of competent courts in India, unless otherwise required by law.",
  },
  {
    title: "12. Contact",
    content:
      "For questions regarding these Terms, contact us at info@breathartinstitute.in.",
  },
];

const Terms = () => {
  return (
    <main className="min-h-screen bg-[#05070b] text-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-3xl border border-white/10 bg-linear-to-b from-white/8 to-white/2 px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs tracking-[0.2em] text-cyan-300 uppercase mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-slate-300 max-w-3xl leading-relaxed">
            These Terms govern the use of our website and services. Please read
            them carefully before using the platform.
          </p>
          <p className="mt-3 text-sm text-slate-400">Effective date: 2026-04-02</p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/3 px-5 py-4"
            >
              <h2 className="text-sm font-semibold text-cyan-200 mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-10 rounded-2xl border border-cyan-300/30 bg-cyan-300/5 p-5 text-sm text-slate-200">
          Your use of this Service is also governed by our{" "}
          <Link to="/privacy-policy" className="text-cyan-300 hover:text-cyan-200 underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </main>
  );
};

export default Terms;
