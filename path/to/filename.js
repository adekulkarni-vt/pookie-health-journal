import { createSupabaseClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ... rest of code ...
      console.log("Sign in successful"); // Added for debugging
      setError(null);
    } catch (e) {
      console.error("Error during Google Sign-In:", e);
      setError("Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {/* ... rest of code ... */}
      <h1>Hey there! Welcome to Pookie</h1> {/* Changed greeting text */}
      <p>Sign in with Google to start your health journey.</p>
    </div>
  );
}
