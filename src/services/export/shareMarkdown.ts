import { Platform, Share } from 'react-native';

/**
 * Écrit un .md dans Documents (visible dans Fichiers si le module FS est lié),
 * puis ouvre la feuille de partage iOS — « Enregistrer dans Fichiers ».
 */
export async function shareMarkdownFile(
  filename: string,
  markdown: string,
): Promise<'file' | 'text'> {
  const path = await writeDocument(filename, markdown);
  if (path) {
    await Share.share({
      url: path.startsWith('file://') ? path : `file://${path}`,
      title: filename,
    });
    return 'file';
  }
  await Share.share({
    title: filename,
    message: markdown,
  });
  return 'text';
}

async function writeDocument(
  filename: string,
  markdown: string,
): Promise<string | null> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }
  try {
    // Autolink : absent tant que `pod install` n’a pas été relancé.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNFS = require('@dr.pogodin/react-native-fs') as {
      DocumentDirectoryPath: string;
      writeFile: (path: string, contents: string, encoding: string) => Promise<void>;
    };
    if (!RNFS?.DocumentDirectoryPath) {
      return null;
    }
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, markdown, 'utf8');
    return path;
  } catch {
    return null;
  }
}
