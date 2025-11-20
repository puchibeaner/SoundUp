// Importamos la librería oficial de Neo4j
    const neo4j = require('neo4j-driver');
    // Importamos dotenv para poder leer el archivo .env
    require('dotenv').config();

    // Obtenemos las credenciales desde el archivo .env
    const { DB_URI, DB_USER, DB_PASSWORD } = process.env;

    // Creamos el "driver" (el chofer que maneja la conexión)
    const driver = neo4j.driver(
      DB_URI,
      neo4j.auth.basic(DB_USER, DB_PASSWORD)
    );

    // Función para verificar si la conexión funciona
    async function verificarConexion() {
      try {
        // Intentamos verificar la conectividad
        await driver.verifyConnectivity();
        console.log('✅ Conexión exitosa a Neo4j');
      } catch (error) {
        console.error('❌ Error conectando a Neo4j:', error);
      }
    }

    // Ejecutamos la verificación
    verificarConexion();

    // Exportamos el driver para usarlo en otros archivos
    module.exports = driver;