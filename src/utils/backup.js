// Exporta e importa un respaldo completo de la quiniela en formato JSON
// (partidos, participantes y predicciones), para mover los datos entre
// dominios (ej. de localhost a tu URL de Vercel) o entre dispositivos.

export function exportBackup({ matches, participants, predictions }) {
  const payload = {
    app: 'quiniela-familiar',
    version: 1,
    exportedAt: new Date().toISOString(),
    matches,
    participants,
    predictions,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)

  const a = document.createElement('a')
  a.href = url
  a.download = `quiniela-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (
          !Array.isArray(data.matches) ||
          !Array.isArray(data.participants) ||
          typeof data.predictions !== 'object' ||
          data.predictions === null
        ) {
          throw new Error('El archivo no tiene el formato esperado de un respaldo de la quiniela.')
        }
        resolve(data)
      } catch {
        reject(new Error('El archivo no es un respaldo válido de la quiniela.'))
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsText(file)
  })
}
