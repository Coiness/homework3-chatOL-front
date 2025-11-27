import { Button } from '@/components/ui/button'
import { useCounterStore } from '@/store/useCounterStore'

function App() {
  const { count, increment, decrement, reset } = useCounterStore()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <h1 className="text-4xl font-bold text-foreground">Chat Online Frontend</h1>
      <p className="text-muted-foreground">
        React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Zustand
      </p>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-2xl font-semibold">Count: {count}</p>
        <div className="flex gap-2">
          <Button onClick={decrement} variant="outline">
            Decrement
          </Button>
          <Button onClick={reset} variant="secondary">
            Reset
          </Button>
          <Button onClick={increment}>Increment</Button>
        </div>
      </div>
    </div>
  )
}

export default App
