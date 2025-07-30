// post install script to download and install Pandoc
// This script will download the appropriate Pandoc binary based on the OS and extract it to the
// resources directory of the application. It will also handle different archive formats like .zip and .tar.gz
// Make sure to run this script after the application is built, as it relies on the __dirname being set correctly
// in the context of the built application.
import https from 'https'
import fs from 'fs'
const { createWriteStream } = fs
import {
  platform,
  // arch,
  tmpdir
} from 'os'
import path from 'path'
import unzipper from 'unzipper'
import tar from 'tar'
import { getDefaultPath } from './filesystem'

const version = '3.7.0.2'

function getPandocDownloadURL() {
  const plat = platform()
  // const arc = arch()

  if (plat === 'win32') {
    return `https://github.com/jgm/pandoc/releases/download/${version}/pandoc-${version}-windows-x86_64.zip`
  } else if (plat === 'darwin') {
    return `https://github.com/jgm/pandoc/releases/download/${version}/pandoc-${version}-x86_64-macOS.zip`
  } else if (plat === 'linux') {
    return `https://github.com/jgm/pandoc/releases/download/${version}/pandoc-${version}-linux-amd64.tar.gz`
  } else {
    throw new Error('Unsupported platform: ' + plat)
  }
}

function downloadFile(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filePath)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleResponse = (response: any): void => {
      // Handle redirects
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        file.close()
        fs.unlinkSync(filePath) // Clean up partial file
        downloadFile(response.headers.location, filePath).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(filePath) // Clean up partial file
        reject(new Error(`Download failed: ${response.statusCode}`))
        return
      }

      response.pipe(file)
      file.on('finish', () => {
        file.close(() => resolve())
      })
      file.on('error', reject)
    }

    https.get(url, handleResponse).on('error', reject)
  })
}

async function extractFile(filePath: string, outputPath: string): Promise<void> {
  console.log(`Extracting ${filePath} to ${outputPath}`)
  if (filePath.endsWith('.zip')) {
    return unzipper.Open.file(filePath).then((directory) =>
      directory.extract({ path: outputPath, concurrency: 5 })
    )
  } else if (filePath.endsWith('.tar.gz')) {
    return tar.x({ file: filePath, cwd: outputPath, strip: 1 })
  } else if (filePath.endsWith('.gz')) {
    return tar.x({ file: filePath, cwd: outputPath, strip: 1 })
  } else if (filePath.endsWith('.tar')) {
    return tar.x({ file: filePath, cwd: outputPath, strip: 1 })
  } else {
    throw new Error('Unknown archive format.')
  }
}

export async function installPandoc() {
  const destDir = getPandocDir()
  const url = getPandocDownloadURL()
  const tempFile = path.join(tmpdir(), `pandoc-download${path.extname(url)}`)

  console.log('Downloading Pandoc from:', url)
  await downloadFile(url, tempFile)

  console.log('Extracting to:', destDir)
  fs.mkdirSync(destDir, { recursive: true })
  await extractFile(tempFile, destDir)

  console.log('✅ Pandoc installed at:', destDir)
}

const getPandocDir = (): string => {
  const destDir = path.join(getDefaultPath(), '.resources', 'pandoc')
  return destDir
}

export function getPandocPath(): string {
  const plat = platform()
  const destDir = getPandocDir()

  if (plat === 'win32') {
    return path.join(destDir, `pandoc-${version}`, 'pandoc.exe')
  } else {
    return path.join(destDir, 'bin', 'pandoc') // binary is usually in bin/
  }
}

export function ensurePandocInstalled() {
  const binary = getPandocPath()
  if (!fs.existsSync(binary)) {
    console.log('Pandoc not found. Installing...')
    installPandoc().catch((err) => {
      console.error('❌ Failed to install Pandoc:', err.message)
      process.exit(1)
    })
  }
}
