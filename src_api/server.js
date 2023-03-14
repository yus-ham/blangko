#!/usr/bin/env node

import { createServer } from 'http';
import { parse } from 'querystring';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import url from '@polka/url';
import app from './app.js';


try {
    const { PORT=3000 } = process.env;
    const public_dir = join(dirname(fileURLToPath(import.meta.url)), '/..', process.argv[2])
    const server = createServer()

    server.on('request', async (req, res) => {
        const info = url(req)
        req.path = info.pathname
        req.query = info.query ? parse(info.query) : {}
        req.search = info.search

        app(req, res, {public_dir})
    })

    server.listen(PORT, err => {
        if (err) throw err;
        console.log(`Running on http://localhost:${PORT}`)
    })
} catch (err) {
	if (err.code !== 'MODULE_NOT_FOUND') throw err;
	console.error(err.message)
	process.exit(1)
}
