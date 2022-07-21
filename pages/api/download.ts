import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

const download = async (req: NextApiRequest, res: NextApiResponse) => {
	const files = fs.readdirSync('./public/files');
	for (const file of files) {
		if (file === req.query.f) {
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader('Content-Disposition', 'attachment; filename=' + file);
			res.setHeader('Content-Length', fs.statSync('./public/files/' + file).size);
			fs.createReadStream('./public/files/' + file).pipe(res);
			return;
		}
	}
	res.status(404).json({ message: 'File not found' });
};

export default download;
