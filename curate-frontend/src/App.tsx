import { useState } from 'react'
import Hero from './components/Hero'
import Studio from './components/Studio'
import './App.css'

export default function App() {
  const [view, setView] = useState<'home' | 'studio'>('home')

  return view === 'home' ? (
    <Hero onStart={() => setView('studio')} />
  ) : (
    <Studio onHome={() => setView('home')} />
  )
}
