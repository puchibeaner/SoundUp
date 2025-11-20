import { useState } from 'react'
import './App.css'

function App() {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Selecciona un archivo");

    // Crear el paquete de datos para enviar
    const formData = new FormData();
    formData.append('audioFile', archivo); // Debe coincidir con backend
    formData.append('titulo', titulo);
    formData.append('artista', artista);
    formData.append('genero', genero);

    try {
      setMensaje("Subiendo...");
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.exito) {
        setMensaje("¡Éxito! Canción guardada y nodo creado.");
      } else {
        setMensaje("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error de conexión con el servidor");
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Subir Música 🎵</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Título de la canción" 
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          required
        />
        <input 
          type="text" 
          placeholder="Nombre del Artista" 
          value={artista}
          onChange={e => setArtista(e.target.value)}
          required
        />
        <input 
          type="text" 
          placeholder="Género (Rock, Pop...)" 
          value={genero}
          onChange={e => setGenero(e.target.value)}
          required
        />
        
        <div style={{ border: '1px dashed #ccc', padding: '10px' }}>
          <label>Archivo MP3: </label>
          <input 
            type="file" 
            accept="audio/*"
            onChange={e => setArchivo(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none' }}>
          Subir a la Plataforma
        </button>
      </form>

      {mensaje && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{mensaje}</p>}
    </div>
  )
}

export default App