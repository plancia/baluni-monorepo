import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_ROOT_PATH = path.join(__dirname, 'artifacts');

/**
 * scan all json files in the artifacts folder and generate types from them
 */
function generateTypesFromJson(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      generateTypesFromJson(filePath);
    } else {
      if (file.endsWith('.json')) {
        const exist=fs.existsSync(path.join(dir, file.replace('.json', '.ts')))
        if (exist) {
          fs.unlinkSync(path.join(dir, file.replace('.json', '.ts')));
        }
        const json = fs.readFileSync(filePath, 'utf-8');

        const name = file.replace('.json', '.ts');
        const constName= file.replace('.json', '');
        const content = `const ${constName} = ${json.trimEnd()} as const; export default ${constName};`;
        fs.writeFileSync(path.join(dir, `${name}`), content);
      }
    }
  });
}

generateTypesFromJson(ARTIFACTS_ROOT_PATH);
