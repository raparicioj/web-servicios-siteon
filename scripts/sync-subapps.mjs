import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const subapps = ['calendario', 'admin-calendario', 'Gastos', 'aniversario'];
const staticFiles = [
  'SiteON_transparent.png',
  'SiteON.png',
  'rodrigo-director.png',
  'equipo.jpg',
  'fondo-hero.png',
  'SiteON Tecnología - Brochure Corporativo.pdf',
  'Mi_Calendario_Instructivo_de_Uso.pdf',
  'brochure-siteon.html',
  'template-comercial.html',
  'firma-rodrigo.html',
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

for (const app of subapps) {
  const srcPath = path.join(rootDir, app);
  const destPath = path.join(publicDir, app);
  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
    console.log(`[sync-subapps] Sincronizado subapp: /${app} -> public/${app}`);
  }
}

for (const file of staticFiles) {
  const srcFile = path.join(rootDir, file);
  const destFile = path.join(publicDir, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`[sync-subapps] Copiado activo estático: ${file} -> public/${file}`);
  }
}

