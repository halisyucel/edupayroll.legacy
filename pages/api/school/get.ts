import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export interface School {
	name: string;
	director: string;
	editor: string;
	editorTitle: string;
}

const get = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	const [rows] = await pool.query(`SELECT * FROM school_information WHERE id = 1`);
	const result = JSON.parse(JSON.stringify(rows))[0] as School;
	res.status(200).json(result);
};

export default get;
