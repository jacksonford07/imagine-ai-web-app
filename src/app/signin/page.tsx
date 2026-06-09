import { Command } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

function GoogleIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5h-1.9V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C40.9 35.7 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export default function SignInPage(): React.ReactElement {
  return (
    <div className="dark grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between border-r border-border bg-zinc-950 p-10 lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Command className="h-6 w-6 text-primary" />
          <span>Imagine AI</span>
        </div>
        <blockquote className="space-y-2">
          <p className="text-lg leading-relaxed text-muted-foreground">
            &ldquo;Every escalation, chat, and cohort metric in one place — no
            more flipping between sheets to see what&apos;s actually
            happening.&rdquo;
          </p>
          <footer className="text-sm text-muted-foreground/70">
            Imagine Education — Operations
          </footer>
        </blockquote>
      </div>

      {/* Sign-in panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Sign in to the dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Use an allowlisted Google account to continue.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/ceo" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              <GoogleIcon />
              Continue with Google
            </Button>
          </form>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Access is restricted to authorised Imagine Education staff. By
            continuing you agree to our acceptable-use policy.
          </p>
        </div>
      </div>
    </div>
  );
}
