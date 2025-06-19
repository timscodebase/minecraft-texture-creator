import React from "react";

type AuthSectionProps = {
  user: null | { uid: string; displayName?: string | null };
  onSignIn: () => void;
  onSignOut: () => void;
};

export default function AuthSection({
  user,
  onSignIn,
  onSignOut,
}: AuthSectionProps) {
  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className='px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200'
      >
        Sign In with Google
      </button>
    );
  }
  return (
    <div>
      <p className='text-sm mb-4 text-gray-400'>
        User:{" "}
        <span className='font-mono bg-[#013503] p-1 rounded'>
          {user.displayName || user.uid}
        </span>
      </p>
      <button
        onClick={onSignOut}
        className='px-4 py-2 bg-red-600 text-white rounded font-bold mb-4'
      >
        Sign Out
      </button>
    </div>
  );
}
