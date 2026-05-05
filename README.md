# Harvest Dashboard — AR

Dashboard de cosecha Argentina (Ingleby Farms).

## Estructura

```
harvest-dashboard-ar/
├── public/
│   ├── index.html          # Dashboard cosecha
│   ├── ventas.html         # Contratos y movimientos
│   ├── harvest_data.json   # Generado por watcher.py
│   └── contracts_data.json # Gestionado via API
├── api/
│   ├── data.js             # GET /api/data
│   └── contracts.js        # GET/POST /api/contracts
├── watcher.py              # Monitor de Excel → GitHub
├── harvest_watcher_ar.bat  # Startup Windows
└── vercel.json
```

## Setup

### 1. Repo GitHub
Crear repo: `gcuki11-bit/harvest-dashboard-ar`

### 2. Vercel
- Importar repo → Deploy
- Variable de entorno: `GITHUB_TOKEN = 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`

### 3. Watcher
Copiar `watcher.py` a la carpeta de trabajo junto al Excel:
```
C:\Users\Geronimo\Ingleby\AR-Office - General\IT - Internet & Telefono\Desarrollo de proyectos\REPORTE DE COSECHA AR\
```

Ejecutar:
```powershell
C:\Users\Geronimo\AppData\Local\Python\pythoncore-3.14-64\python.exe watcher.py
```

### 4. Startup automático
Copiar `harvest_watcher_ar.bat` a:
```
C:\Users\Geronimo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
```

## Deploy manual

```powershell
Set-Location "C:\Users\Geronimo\Ingleby\AR-Office - General\IT - Internet & Telefono\Desarrollo de proyectos\REPORTE DE COSECHA AR\harvest-dashboard-ar"
git pull --no-edit
git add public/index.html public/ventas.html
git commit -m "update: mensaje"
git push
```
