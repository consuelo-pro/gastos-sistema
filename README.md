# Sistema de gastos e ingresos

Escribís dentro del dashboard ("gasté 5000 en super", "cobré 80000 de fulano") y
queda registrado solo. Claude interpreta el texto y lo ves reflejado al toque en
tus propios gráficos, con tu login.

## Cómo está armado

```
backend/     → recibe el texto, lo interpreta con Claude, lo guarda
dashboard/   → tu web privada para escribir y ver los movimientos (login + gráficos)
```

## Puesta en marcha (una sola vez)

### 1. Base de datos — Supabase

1. Creá una cuenta gratis en supabase.com y un proyecto nuevo.
2. Andá a **SQL Editor** → pegá el contenido de `backend/db/schema.sql` → ejecutar.
3. Andá a **Project Settings → Database** y copiá el "Connection string" (modo *URI*). Eso es tu `DATABASE_URL`.

### 2. Backend — desplegarlo (Render, gratis)

1. Subí la carpeta `backend/` a un repo de GitHub (o el mismo repo, apuntando a esa subcarpeta).
2. En render.com, creá un **Web Service** apuntando a ese repo.
3. Root directory: `backend` — Build command: `npm install` — Start command: `npm start`.
4. Cargá las variables de entorno (mirá `backend/.env.example`) en la sección *Environment* de Render.
5. Una vez desplegado, te da una URL como `https://tu-app.onrender.com`.

### 3. Dashboard — desplegarlo (Vercel o Netlify, gratis)

1. En Vercel, importá el repo, seteá Root directory: `dashboard` y la variable `VITE_API_URL` con la URL del backend (paso anterior).
2. Deploy. Te da tu URL propia, ej: `https://tus-cuentas.vercel.app`.
3. Entrás con la contraseña que pusiste en `ADMIN_PASSWORD`.

## Probarlo antes de desplegar (en tu compu)

```bash
# Backend
cd backend
cp .env.example .env   # completá los valores
npm install
npm run dev             # corre en localhost:3000

# Dashboard (en otra terminal)
cd dashboard
npm install
npm run dev              # corre en localhost:5173
```

## Cómo seguir

- Los textos que Claude no entienda bien (categoría rara, monto mal interpretado)
  te van a servir para ajustar el prompt en `backend/src/claudeParser.js`.
- Si más adelante querés sumar fotos de tickets, se agrega ahí mismo: subís la
  imagen y se la pasás a Claude como imagen en vez de texto.
