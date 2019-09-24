// tslint:disable-next-line: no-submodule-imports
import { readdir, stat } from 'mz/fs';
import * as path from 'path';

export async function traverseDir(
  dir: string | Buffer,
  fileFunc: (fileName: string, dir: string) => Promise<any>): Promise<void> {
  const files = await readdir(dir);
  for (const file of files) {
    const fullName = path.join(dir.toString(), file);
    const fileStat = await stat(fullName);
    if (fileStat.isDirectory()) {
      await traverseDir(fullName, fileFunc);
    } else if (fileStat.isFile()) {
      await fileFunc(file, dir.toString());
    }
  }
}

export function stringifyOutputString(inStr: string[]): string[]{
  let result: string[] = [];
  inStr.forEach((str)=>{
    result.push('\''+str+'\'');
  })
  return result;
}
