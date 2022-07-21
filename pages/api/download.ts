import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const download = async (req: NextApiRequest, res: NextApiResponse) => {
	const files = fs.readdirSync(path.join(process.cwd(), 'files'));
	for (const file of files) {
		if (file === req.query.f) {
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', 'attachment; filename=' + file);
			fs.createReadStream(path.join(process.cwd(), 'files', file)).pipe(res);
			return;
		}
	}
	res.status(404).json({ message: 'File not found' });
};

export default download;
