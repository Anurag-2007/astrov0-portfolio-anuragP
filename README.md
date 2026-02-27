# 🚀 ASTRO PORTFOLIO  
### A Cinematic 3D Space-Themed Interactive Developer Portfolio
https://v0-anurag-portfolio-space.vercel.app/

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.175-white?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)

> An immersive, game-like 3D portfolio experience that transforms your professional journey into an explorable cosmic universe.

Built with Next.js, React, Three.js, TypeScript, and designed using v0.dev.

---

# 🌌 Overview

Astro Portfolio is not a traditional website.

It is a fully interactive 3D solar system where:

- Each planet represents a portfolio section  
- Users explore via cinematic camera controls  
- Information panels appear as holographic HUD systems  
- Sound effects are procedurally generated in real time  
- Hidden easter eggs reward curiosity  

This project blends creative development, real-time 3D graphics, interactive UI systems, and immersive audio design into one cohesive portfolio experience.

---

# ✨ Key Features

## 🌍 Interactive Solar System
- 8 orbiting planets (Skills, Projects, Experience, Achievements, Education, Photography, Contact, Rogue Planet)
- Real-time orbital mechanics
- Smooth camera transitions with easing
- Mouse + WASD controls
- Zoom and focus mechanics

## 🎨 Advanced 3D Graphics
- Procedurally generated planet textures
- Dynamic atmospheres and glow effects
- Realistic planetary rings
- Starfield with 5000+ particles
- Volumetric nebula clouds
- Asteroid belt (instanced rendering)
- Shooting stars and particle systems
- Central animated sun with corona effects

## 🎮 Interactive Elements
- Click planets to open cinematic info panels
- Astronaut landing animation
- Black hole mini-game (spaghettification effect)
- Idle-triggered meteor shower
- Triple-click hidden quote
- Time-based deep space signal

## 🔊 Immersive Audio System
- 18+ procedural sound effects
- Built using Web Audio API
- No external audio files
- Dynamic sound feedback
- Toggle sound system

## 📸 Photography Planet
- Interactive image carousel
- Navigation dots & arrows
- Smooth transitions
- Fully customizable gallery

---

# 🛠 Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript

### 3D & Graphics
- Three.js
- @react-three/fiber
- @react-three/drei

### Styling & UI
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide Icons

### Audio
- Web Audio API (procedural synthesis)

### Forms & Validation
- React Hook Form
- Zod

### Utilities
- date-fns
- recharts
- next-themes
- embla-carousel
- sonner

---

# 🧠 How It Works

1. User lands on mission control launch screen  
2. Launch triggers warp transition  
3. 3D solar system initializes  
4. Camera controller enables exploration  
5. Selecting a planet opens detailed info panel  
6. Easter eggs trigger based on interaction, time, or inactivity  

Rendering is handled via WebGL through Three.js with GPU-accelerated transforms and optimized particle systems.

---

# 📂 Project Structure

```
app/
components/space/
public/photos/
```

Key components include:

- `space-portfolio.tsx`
- `space-scene.tsx`
- `planet.tsx`
- `black-hole.tsx`
- `camera-controller.tsx`
- `sound-engine.tsx`
- `start-screen.tsx`
- `hud-overlay.tsx`
- `info-panel.tsx`

---

# ⚙️ Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/astro-portfolio.git
cd astro-portfolio
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🎨 Customization Guide

## Update Portfolio Content

Edit:

```
/components/space/planet-data.ts
```

Modify:
- Skills
- Projects
- Contact links
- Education
- Planet colors
- Orbit speeds

## Add Photos

Create:

```
/public/photos/
```

Add images and update paths inside planet configuration.

---

# 🚀 Deployment

## Deploy on Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy

No environment variables required.

---

# 📊 Performance

- 60 FPS on modern desktops
- Optimized particle rendering
- Instanced meshes for asteroid belt
- Dynamic DPR scaling
- Lazy-loaded 3D components
- Lighthouse Accessibility: 95+

---

# 🎭 Easter Eggs

- Deep Space Signal (time-based)
- Triple-click hidden message
- Idle meteor shower
- Rogue hidden planet
- Black hole archive entries

---

# 🔮 Future Roadmap

- Blog planet
- VR support
- Multiplayer exploration mode
- Resume download integration
- Music system
- More mini-games

---

# 📜 License

MIT License  
Copyright (c) 2024 Anurag Pandit

---

# 🔗 Connect

- mail: panditanurag3101@gmail.com 
- GitHub: https://github.com/Anurag-2007  
- LinkedIn:[ Linkedin  ](https://www.linkedin.com/in/anurag-pandit-19673736a/)

---

**Built with v0.dev , caffeine, and cosmic curiosity. ☕🌌**
