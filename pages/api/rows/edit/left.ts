import pool from '../../../../lib/pool';
import { auth } from '../../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

const left = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	try {
		await pool.query(
			`
			UPDATE document_rows
			SET teacherID = ?, courseCode = ?
			WHERE id = ?
		`,
			[req.body.teacherID, req.body.courseCode, req.body.id],
		);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default left;
