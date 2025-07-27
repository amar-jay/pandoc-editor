import path from 'path'
import os from 'os'
import fs from 'fs'

export const getFilePath = async (filePath: string, createDir = false): Promise<string> => {
  const dirname = path.dirname(filePath)
  if (filePath.startsWith('/') || dirname === '.' || dirname === '' || dirname.startsWith('\\')) {
    filePath = path.join(os.homedir(), '.pandoc-editor', filePath)
    return filePath
  } else if (!filePath.endsWith('.md')) {
    filePath += '.md'
    return filePath
  }
  if (createDir) {
    await fs.promises.mkdir(dirname, { recursive: true })
    console.log('Saving file to:', dirname, filePath)
  }

  return filePath
}
