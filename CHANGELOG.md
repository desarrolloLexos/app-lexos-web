# Registro de cambios (Changelog)

## [Versión 2.0.0] - Fecha

### Cambios

- persistencia de datos

### Nuevas Características

- Implementada la función `updateTareas` para actualizar tareas en Firestore.
- Agregada la función `guardarConVerificacion` para guardar datos con verificación de integridad.
- Añadida la función `verificarIntegridad` para verificar la integridad de los datos en Firestore.
- Introducida la función `actualizarCamposTarea` para actualizar los campos de la tarea en Firestore.
- Ajustada la consulta de la función `updateStatusByFolioAndStatus` para acceder a la subcolección `tareas_ot` dentro de un usuario específico.
