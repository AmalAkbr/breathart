import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Terms and Conditions
        </h1>
        <p className="mb-4">
          Welcome to BreathArt! By using our platform, you agree to comply with
          and be bound by the following terms and conditions. Please read them
          carefully before using our services.
        </p>
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using BreathArt, you acknowledge that you have read,
          understood, and agree to be bound by these terms and conditions, as
          well as our Privacy Policy. If you do not agree to these terms, please
          do not use our services.
        </p>
        <h2 className="text-2xl font-semibold mb-4">
          2. User Responsibilities
        </h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your
          account and password, and for restricting access to your computer. You
          agree to accept responsibility for all activities that occur under
          your account or password.
        </p>
        <h2 className="text-2xl font-semibold mb-4">3. Prohibited Conduct</h2>
        <p className="mb-4">
          You agree not to use BreathArt for any unlawful purpose or in any way
          that could damage, disable, overburden, or impair our services. This
          includes, but is not limited to, uploading harmful content, engaging
          in harassment, or attempting to gain unauthorized access to our
          systems.
        </p>
        <h2 className="text-2xl font-semibold mb-4">
          4. Intellectual Property
        </h2>
        <p className="mb-4">
          All content on BreathArt, including but not limited to text, graphics,
          logos, and software, is the property of BreathArt or its licensors and
          is protected by copyright and other intellectual property laws. You
          may not use, reproduce, or distribute any content from our platform
          without our express written permission.
        </p>
        <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
        <p className="mb-4">
          We reserve the right to terminate or suspend your account and access
          to our services at our sole discretion, without notice, for conduct
          that we believe violates these terms or is harmful to other users of
          BreathArt, us, or third parties.
        </p>
        <h2 className="text-2xl font-semibold mb-4">
          6. Limitation of Liability
        </h2>
        <p className="mb-4">
          In no event shall BreathArt, its affiliates, or its licensors be
          liable for any indirect, incidental, special, consequential, or
          punitive damages arising out of or in connection with your use of our
          services.
        </p>
        <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms and conditions at any time.
          We will provide notice of any changes by posting the new terms on this
          page. Your continued use of our services after any such changes
          constitutes your acceptance of the new terms.
        </p>
        <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these terms and conditions, please
          contact us at{" "}
          <a
            href="mailto:support@breathart.com"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            support@breathart.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Terms;
