const express = require('express');
const driver = require('./neo4j');
const multer = require('multer'); // El gestor de archivos
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Para permitir que React nos hable
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 1. Configuración de CORS (Permitir al Frontend hablar con Backend)
app.use(cors());
app.use(express.json());

// 2. Configuración de Almacenamiento (Dónde guardar los MP3)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Usamos la ruta que definiste en el archivo .env
    const uploadPath = process.env.MUSIC_PATH;
    
    // Verificamos si la carpeta existe, si no, da error (créala manualmente primero)
    if (!fs.existsSync(uploadPath)){
        return cb(new Error('La carpeta de música no existe o la ruta es incorrecta'), false);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generamos un nombre único para el archivo para evitar duplicados
    // Ej: cancion-123456789.mp3
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- RUTAS ---

app.get('/', (req, res) => {
  res.send('Servidor MusicApp: Sistema de Archivos Activo');
});

// RUTA IMPORTANTE: Subir Canción
// 'audioFile' es el nombre del campo que debe enviar el frontend
app.post('/upload', upload.single('audioFile'), async (req, res) => {
  const session = driver.session();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Datos que vienen del formulario (título, artista)
    const { titulo, artista, genero } = req.body;
    const rutaArchivo = req.file.path; // Ruta donde se guardó en tu 3TB

    console.log(`Procesando subida: ${titulo} por ${artista}`);

    // Consulta Cypher para crear los nodos y relaciones
    // Lógica:
    // 1. Busca o crea al Artista (MERGE)
    // 2. Crea la Canción (CREATE)
    // 3. Conecta Artista -> Canción
    const query = `
      MERGE (a:Artista {nombre: $artista})
      CREATE (c:Cancion {
        titulo: $titulo,
        genero: $genero,
        ruta: $rutaArchivo,
        fechaSubida: datetime()
      })
      CREATE (a)-[:INTERPRETA]->(c)
      RETURN c, a
    `;

    await session.run(query, {
      artista: artista,
      titulo: titulo,
      genero: genero,
      rutaArchivo: rutaArchivo
    });

    res.json({
      exito: true,
      mensaje: "Canción guardada en disco y registrada en Neo4j",
      archivo: req.file.filename
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, error: error.message });
  } finally {
    await session.close();
  }
});

app.listen(port, () => {
  console.log(`🎧 Servidor listo en http://localhost:${port}`);
  console.log(`📂 Guardando música en: ${process.env.MUSIC_PATH}`);
});