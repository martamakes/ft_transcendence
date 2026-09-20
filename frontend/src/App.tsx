const checks = [
  { label: 'Frontend', value: 'React + TypeScript' },
  { label: 'Styling', value: 'Tailwind CSS' },
  { label: 'Status', value: 'Scaffold ready' },
];

export function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center">
        <div className="w-full rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            ft_transcendence
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Pong Arena
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Real-time multiplayer Pong starts here. The frontend scaffold is running and ready
            for the first game features.
          </p>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {checks.map((check) => (
              <div
                className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4"
                key={check.label}
              >
                <dt className="text-sm text-slate-400">{check.label}</dt>
                <dd className="mt-1 font-semibold text-cyan-200">{check.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
