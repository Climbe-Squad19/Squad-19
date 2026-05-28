import { Outlet } from 'react-router-dom'
import '../../index.css'
import logo from '../../assets/climbe_logo.svg'

export function AuthLayout() {
  return (
    <main className="w-full min-h-screen bg-zinc-950 text-zinc-100 grid grid-cols-2">
      <div className="relative w-full h-screen border-r border-zinc-800 px-12 flex flex-col justify-center gap-6 overflow-hidden">

        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-[#79C6C0] rounded-full blur-[120px] pointer-events-none" />

        <div
          className="absolute -top-30 right-5 w-80 h-80 rounded-full bg-[#1A365D] pointer-events-none" />

        <div className="absolute inset-0 backdrop-blur-[60px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
          }}
        />

        <div className="relative z-10 flex flex-col gap-6">
          <img src={logo} alt="Climbe Investimentos" className="w-51.25 h-17" />

          <h1 className="text-4xl font-bold leading-tight">
            O melhor investimento <br />
            precisa da melhor <br />
            orientação!
          </h1>
        </div>
      </div>

      <Outlet />
    </main>
  )
}