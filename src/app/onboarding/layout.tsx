export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col px-6 py-8 max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-widest">EVOLT</p>
      </div>
      {children}
    </main>
  );
}
