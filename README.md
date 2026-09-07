# Sistema de gastos e ingresos por WhatsApp

Le escribís por WhatsApp ("gasté 5000 en super", "cobré 80000 de fulano") y queda
registrado solo. Lo ves en tu propio dashboard, con tu login.

## Cómo está armado

```
backend/     → recibe el mensaje de WhatsApp, lo interpreta con Claude, lo guarda
dashboard/   → tu web privada para ver los movimientos (login + gráficos)
```

## Puesta en marcha (una sola vez)

### 1. Base de datos — Supabase

1. Creá una cuenta gratis en supabase.com y un proyecto nuevo.
2. Andá a **SQL Editor** → pegá el contenido de `backend/db/schema.sql` → ejecutar.
3. Andá a **Project Settings → Database** y copiá el "Connection string" (modo *URI*). Eso es tu `DATABASE_URL`.

### 2. WhatsApp — Meta for Developers

1. Creá una cuenta en developers.facebook.com y una app de tipo "Business".
2. Agregale el producto **WhatsApp**. Te da un número de prueba gratis y un token temporal.
3. Anotá el `Phone Number ID` y el `Token` — van en las variables de entorno.
4. Inventá una palabra para `WHATSAPP_VERIFY_TOKEN` (cualquier frase que elijas vos).

### 3. Backend — desplegarlo (Render, gratis)

1. Subí la carpeta `backend/` a un repo de GitHub.
2. En render.com, creá un **Web Service** apuntando a ese repo.
3. Build command: `npm install` — Start command: `npm start`.
4. Cargá las variables de entorno (mirá `backend/.env.example`) en la sección *Environment* de Render.
5. Una vez desplegado, te da una URL como `https://tu-app.onrender.com`.

### 4. Conectar el webhook en Meta

1. En tu app de Meta, sección WhatsApp → Configuration → Webhook.
2. Callback URL: `https://tu-app.onrender.com/webhook`
3. Verify token: el mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`.
4. Suscribite al campo `messages`.

### 5. Dashboard — desplegarlo (Vercel o Netlify, gratis)

1. Subí la carpeta `dashboard/` a otro repo (o el mismo, aparte).
2. En Vercel, importá el repo, seteá la variable `VITE_API_URL` con la URL del backend (paso 3).
3. Deploy. Te da tu URL propia, ej: `https://tus-cuentas.vercel.app`.
4. Entrás con la contraseña que pusiste en `ADMIN_PASSWORD`.

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

Para probar el webhook localmente sin desplegar necesitás un túnel (ej: `ngrok http 3000`)
y usar esa URL de ngrok en la configuración de Meta.

## Cómo seguir

- Los mensajes que Claude no entienda bien (categoría rara, monto mal interpretado)
  te van a servir para ajustar el prompt en `backend/src/claudeParser.js`.
- Si más adelante querés sumar fotos de tickets, se agrega ahí mismo: WhatsApp manda
  la imagen, se la pasás a Claude como imagen en vez de texto.
