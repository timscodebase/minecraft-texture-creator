import { auth } from '../utils/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function GoogleSignInButton() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // User is now signed in!
  };

  return (
    <button onClick={handleSignIn} className="px-4 py-2 bg-blue-600 text-white rounded">
      Sign in with Google
    </button>
  );
}
export default GoogleSignInButton;