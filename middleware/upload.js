const multer = require('multer')
const sharp  = require('sharp')
const path   = require('path')
const fs     = require('fs')
const { UPLOAD_DIR, MAX_FILE_SIZE } = require('../config/config')

// Carpeta base resuelta de forma absoluta
const BASE_UPLOAD_PATH = path.resolve(UPLOAD_DIR)

// ── Configuración Multer ────────────────────────────────────
const storage = multer.memoryStorage()  // procesar en memoria antes de guardar

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif',
    'image/bmp', 'image/tiff', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no permitido. Use imágenes, PDF, DOC o TXT'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
})

// ── Helpers de procesamiento ────────────────────────────────

/**
 * Convierte imagen a WEBP y la guarda en uploads/{subfolder}/
 * @param {Buffer} buffer     Buffer del archivo desde multer
 * @param {string} subfolder  'usuarios' | 'clientes' | 'documentos'
 * @param {string} original   Nombre original del archivo
 * @returns {string}          Ruta relativa: /uploads/{subfolder}/filename.webp
 */
const processImage = async (buffer, subfolder, original) => {
  const dir = path.join(BASE_UPLOAD_PATH, subfolder)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const filename  = `${Date.now()}-${path.parse(original).name}.webp`
  const outputPath = path.join(dir, filename)

  await sharp(buffer)
    .webp({ quality: 80 })
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .toFile(outputPath)

  return `/uploads/${subfolder}/${filename}`
}

/**
 * Procesa el logo del negocio: WEBP + recorte cuadrado 400x400
 * @param {Buffer} buffer    Buffer del logo
 * @param {string} original  Nombre original del archivo
 * @returns {string}         Ruta relativa: /uploads/logo/filename.webp
 */
const processLogo = async (buffer, original) => {
  const dir = path.join(BASE_UPLOAD_PATH, 'logo')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const filename  = `${Date.now()}-${path.parse(original).name}.webp`
  const outputPath = path.join(dir, filename)

  await sharp(buffer)
    .webp({ quality: 90 })
    .resize(400, 400, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFile(outputPath)

  return `/uploads/logo/${filename}`
}

/**
 * Guarda un documento (PDF, DOC, TXT) sin conversión.
 * @param {Buffer} buffer    Buffer del archivo
 * @param {string} original  Nombre original
 * @returns {string}         Ruta relativa: /uploads/documentos/filename.ext
 */
const saveDocument = (buffer, original) => {
  const dir = path.join(BASE_UPLOAD_PATH, 'documentos')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const ext      = path.extname(original)
  const filename = `${Date.now()}-${path.parse(original).name}${ext}`
  fs.writeFileSync(path.join(dir, filename), buffer)

  return `/uploads/documentos/${filename}`
}

module.exports = { upload, processImage, processLogo, saveDocument }
