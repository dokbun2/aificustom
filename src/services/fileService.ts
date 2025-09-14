import type { AnyRootJsonData } from '../../types';

export class FileService {
  /**
   * Processes a JSON file and returns parsed data
   */
  static async processJsonFile(file: File): Promise<AnyRootJsonData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') {
            throw new Error('File is not a valid text file.');
          }
          const parsedData: AnyRootJsonData = JSON.parse(text);
          resolve(parsedData);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          reject(new Error(`Failed to parse JSON: ${errorMessage}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read the file.'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Downloads JSON data as a file
   */
  static downloadJson(data: AnyRootJsonData, fileName: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates if a file is a JSON file
   */
  static isJsonFile(file: File): boolean {
    return file.type === 'application/json' || file.name.endsWith('.json');
  }

  /**
   * Gets a safe filename with timestamp
   */
  static getSafeFileName(baseName: string, extension: string = 'json'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeName = baseName.replace(/[^a-z0-9_-]/gi, '_');
    return `${safeName}_${timestamp}.${extension}`;
  }
}