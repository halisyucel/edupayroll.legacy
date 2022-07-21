import pool from '../../../lib/pool';
import { auth } from '../../../utils/auth';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const password = async (req: NextApiRequest, res: NextApiResponse) => {
	if (!(await auth(req))) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const [accountInformations] = await pool.query(
			`SELECT password_hash FROM account_information WHERE id = 1`,
		);
		const currentPassword = JSON.parse(JSON.stringify(accountInformations))[0].password_hash;
		if (!bcrypt.compareSync(req.body.current, currentPassword))
			return res.status(400).json({ error: 'Current password is incorrect' });
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(req.body.new, salt);
		await pool.query(`UPDATE account_information SET password_hash = ? WHERE id = 1`, [hash]);
		res.status(200).json({ status: 'success' });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default password;
