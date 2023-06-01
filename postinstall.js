import { existsSync, readFileSync, writeFileSync } from 'fs';

if (!existsSync('./config.js')) {
    const cfg = readFileSync('./config.js.sample', 'utf8')
    writeFileSync('./config.js', cfg, {encoding: 'utf8'})
}