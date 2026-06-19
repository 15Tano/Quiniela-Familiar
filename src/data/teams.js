// Mapa de selecciones (nombre en español) -> código ISO 3166-1 alpha-2
// para generar la bandera emoji automáticamente.
export const TEAM_CODES = {
  'República Checa': 'CZ',
  'Sudáfrica': 'ZA',
  'Suiza': 'CH',
  'Bosnia y Herzegovina': 'BA',
  'Canadá': 'CA',
  'Qatar': 'QA',
  'México': 'MX',
  'Corea del Sur': 'KR',
  'EUA': 'US',
  'Estados Unidos': 'US',
  'Australia': 'AU',
  'Escocia': 'GB-SCT',
  'Marruecos': 'MA',
  'Brasil': 'BR',
  'Haití': 'HT',
  'Turquía': 'TR',
  'Paraguay': 'PY',
  'Países Bajos': 'NL',
  'Suecia': 'SE',
  'Alemania': 'DE',
  'Costa de Marfil': 'CI',
  'Ecuador': 'EC',
  'Curaçao': 'CW',
  'Túnez': 'TN',
  'Japón': 'JP',
  'España': 'ES',
  'Arabia Saudita': 'SA',
  'Bélgica': 'BE',
  'Irán': 'IR',
  'Uruguay': 'UY',
  'Cabo Verde': 'CV',
  'Nueva Zelanda': 'NZ',
  'Egipto': 'EG',
  'Argentina': 'AR',
  'Austria': 'AT',
  'Francia': 'FR',
  'Iraq': 'IQ',
  'Noruega': 'NO',
  'Senegal': 'SN',
  'Jordania': 'JO',
  'Argelia': 'DZ',
  'Portugal': 'PT',
  'Uzbekistán': 'UZ',
  'Uzbekistan': 'UZ',
  'Inglaterra': 'GB-ENG',
  'Ghana': 'GH',
  'Panamá': 'PA',
  'Croacia': 'HR',
  'Colombia': 'CO',
  'RD Congo': 'CD',
}

// Secuencias especiales de "tag" unicode para banderas regionales
// que no tienen código ISO de país propio (Inglaterra, Escocia).
const SPECIAL_FLAGS = {
  'GB-ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'GB-SCT': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'GB-WLS': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
}

export function getFlagEmoji(countryName) {
  const code = TEAM_CODES[countryName]
  if (!code) return '🏳️'
  if (SPECIAL_FLAGS[code]) return SPECIAL_FLAGS[code]
  // Convierte el código ISO de 2 letras a la bandera emoji vía Regional Indicator Symbols
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export const ALL_TEAM_NAMES = Object.keys(TEAM_CODES).filter(
  (n) => n !== 'EUA' && n !== 'Uzbekistán' // evitar duplicados en el selector
)
