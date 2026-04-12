import React from "react";
import { Link } from "react-router-dom";

const sectionCard =
  "rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6 sm:py-6";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-[#05070b] text-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-linear-to-b from-white/8 to-white/2 px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs tracking-[0.2em] text-cyan-300 uppercase mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-slate-300 max-w-3xl leading-relaxed">
            This policy explains how Educational Institute collects, uses,
            protects, and discloses information when you use our Service at
            https://breathartinstitute.in/.
          </p>
          <p className="mt-3 text-sm text-slate-400">Effective date: 2026-04-02</p>
        </header>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">1. Introduction</h2>
          <p className="text-slate-300 leading-relaxed">
            Educational Institute ("us", "we", or "our") operates
            https://breathartinstitute.in/ ("Service"). This Privacy Policy
            governs your visit to our Service and explains how we collect,
            safeguard, and disclose information resulting from your use.
          </p>
          <p className="mt-3 text-slate-300 leading-relaxed">
            By using the Service, you agree to this Privacy Policy and our
            <Link to="/terms" className="text-cyan-300 hover:text-cyan-200 underline ml-1">
              Terms and Conditions
            </Link>
            .
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">2. Definitions</h2>
          <ul className="space-y-2 text-slate-300 leading-relaxed list-disc pl-5">
            <li>
              <strong>SERVICE:</strong> The website https://breathartinstitute.in/
              operated by Educational Institute.
            </li>
            <li>
              <strong>PERSONAL DATA:</strong> Data about a living individual who
              can be identified from that data.
            </li>
            <li>
              <strong>USAGE DATA:</strong> Data collected automatically from the
              Service infrastructure, such as page visit duration and device
              diagnostics.
            </li>
            <li>
              <strong>COOKIES:</strong> Small files stored on your device.
            </li>
            <li>
              <strong>DATA CONTROLLER:</strong> Educational Institute determines
              how and why personal data is processed.
            </li>
            <li>
              <strong>DATA PROCESSORS:</strong> Service providers who process
              data on behalf of the Data Controller.
            </li>
            <li>
              <strong>DATA SUBJECT:</strong> Any living individual whose personal
              data is processed.
            </li>
            <li>
              <strong>USER:</strong> The individual using our Service.
            </li>
          </ul>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">3. Information Collection and Use</h2>
          <p className="text-slate-300 leading-relaxed">
            We collect limited information to provide and improve our Service.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">4. Types of Data Collected</h2>

          <h3 className="text-lg font-medium text-white mb-2">Personal Data</h3>
          <p className="text-slate-300 leading-relaxed">
            While using our Service, we may ask you to provide personally
            identifiable information. The personal data we collect is:
          </p>
          <ul className="mt-2 mb-4 list-disc pl-5 text-slate-300 space-y-1">
            <li>Email address only</li>
          </ul>

          <h3 className="text-lg font-medium text-white mb-2">Usage Data</h3>
          <p className="text-slate-300 leading-relaxed">
            We may collect technical usage data such as IP address, browser
            version, visited pages, visit date and time, time spent, device type,
            operating system, and similar diagnostic information.
          </p>

          <h3 className="text-lg font-medium text-white mt-4 mb-2">Tracking Cookies Data</h3>
          <p className="text-slate-300 leading-relaxed">
            We use cookies and similar technologies to operate and improve our
            Service. You can configure your browser to refuse cookies, but some
            parts of the Service may not function properly.
          </p>
          <p className="mt-2 text-slate-300 leading-relaxed">Examples of cookies we use:</p>
          <ul className="mt-2 list-disc pl-5 text-slate-300 space-y-1">
            <li>Session Cookies</li>
            <li>Preference Cookies</li>
            <li>Security Cookies</li>
            <li>Advertising Cookies</li>
          </ul>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">5. Use of Data</h2>
          <p className="text-slate-300 leading-relaxed mb-2">
            Educational Institute uses the collected data to:
          </p>
          <ul className="list-disc pl-5 text-slate-300 space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Notify you about changes to the Service</li>
            <li>Provide support and respond to enquiries</li>
            <li>Monitor and improve Service performance</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Send important account or service notices</li>
            <li>Comply with legal obligations and enforce agreements</li>
          </ul>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">6. Retention of Data</h2>
          <p className="text-slate-300 leading-relaxed">
            We retain personal data only as long as necessary for the purposes
            stated in this Privacy Policy, legal compliance, dispute resolution,
            and policy enforcement.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">7. Transfer of Data</h2>
          <p className="text-slate-300 leading-relaxed">
            Your information may be processed in countries outside your location,
            including India and UAE, where data protection laws may differ. By
            using our Service and providing data, you consent to this transfer.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">8. Disclosure of Data</h2>
          <p className="text-slate-300 leading-relaxed mb-2">
            We may disclose personal information:
          </p>
          <ul className="list-disc pl-5 text-slate-300 space-y-1">
            <li>To comply with law enforcement or legal requests</li>
            <li>As part of a merger, acquisition, or asset transfer</li>
            <li>To service providers and partners supporting our operations</li>
            <li>To protect rights, property, safety, and security</li>
            <li>With your consent</li>
          </ul>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">9. Security of Data</h2>
          <p className="text-slate-300 leading-relaxed">
            We use commercially reasonable measures to protect personal data.
            However, no internet transmission or storage method is 100% secure.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">
            10. GDPR Rights (EU/EEA)
          </h2>
          <p className="text-slate-300 leading-relaxed mb-2">
            If you are in the EU/EEA, you may have rights to access, rectify,
            delete, restrict, object to processing, and request portability of
            your personal data.
          </p>
          <p className="text-slate-300 leading-relaxed">
            To exercise these rights, contact info@breathartinstitute.in.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">11. CalOPPA Rights</h2>
          <p className="text-slate-300 leading-relaxed mb-2">
            In line with CalOPPA, users can review this Privacy Policy, visit the
            site anonymously, and request changes to their personal information.
          </p>
          <p className="text-slate-300 leading-relaxed">
            We honor Do Not Track signals where a supported browser mechanism is
            enabled.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">12. CCPA Rights</h2>
          <p className="text-slate-300 leading-relaxed mb-2">
            California residents may request details about personal information
            collected, request deletion, and request that data not be sold.
          </p>
          <p className="text-slate-300 leading-relaxed">
            To submit requests, email info@breathartinstitute.in.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">13. Service Providers</h2>
          <p className="text-slate-300 leading-relaxed">
            We may use third-party companies and individuals to support and
            improve our Service. They access personal data only as needed to
            perform tasks for us and must not use it for other purposes.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">14. Analytics</h2>
          <p className="text-slate-300 leading-relaxed">
            We may use third-party analytics services to better understand and
            improve Service usage.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">15. CI/CD Tools</h2>
          <p className="text-slate-300 leading-relaxed">
            We may use third-party providers to automate development and
            deployment processes for the Service.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">16. Behavioral Remarketing</h2>
          <p className="text-slate-300 leading-relaxed">
            We may use remarketing services to display relevant ads based on past
            interactions with our Service.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">17. Links to Other Sites</h2>
          <p className="text-slate-300 leading-relaxed">
            Our Service may contain links to third-party websites. We are not
            responsible for their content or privacy practices. Please review
            their policies before using those sites.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">18. Children's Privacy</h2>
          <p className="text-slate-300 leading-relaxed">
            Our Service is not intended for children under 18. We do not
            knowingly collect personal data from children under 18.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">19. Changes to This Privacy Policy</h2>
          <p className="text-slate-300 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes are
            effective when posted on this page.
          </p>
        </section>

        <section className={sectionCard}>
          <h2 className="text-xl font-semibold text-cyan-200 mb-3">20. Contact Us</h2>
          <p className="text-slate-300 leading-relaxed">
            If you have questions about this Privacy Policy, contact us at
            info@breathartinstitute.in.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
