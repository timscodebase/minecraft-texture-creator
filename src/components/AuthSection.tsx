import React from "react";
import styles from './AuthSection.module.css';

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
        className={styles.signInButton}
      >
        Sign In with Google
      </button>
    );
  }
  return (
    <div>
      <p className={styles.userInfo}>
        User:{" "}
        <span className={styles.userName}>
          {user.displayName || user.uid}
        </span>
      </p>
      <button
        onClick={onSignOut}
        className={styles.signOutButton}
      >
        Sign Out
      </button>
    </div>
  );
}
