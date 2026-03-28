import React from 'react';

const SecurityBlankScreen = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center text-white max-w-md">
        <h1 className="text-xl font-semibold tracking-wide">Protected Content</h1>
        <p className="mt-3 text-sm text-white/70">
          Close developer tools to continue viewing this page.
        </p>
      </div>
    </div>
  );
};

export default SecurityBlankScreen;
