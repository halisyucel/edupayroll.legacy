import pool from '../../../lib/pool';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const login = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const [accountInformations] = await pool.query(
			`SELECT email, password_hash FROM account_information WHERE id = 1`,
		);
		const accountInformation = JSON.parse(JSON.stringify(accountInformations))[0];
		if (accountInformation.email !== req.body.email)
			return res.status(401).json({ error: 'Login failed' });
		if (!bcrypt.compareSync(req.body.password, accountInformation.password_hash))
			return res.status(401).json({ error: 'Login failed' });
		const token = jwt.sign(
			{ email: accountInformation.email },
			process.env.JWT_SECRET as string,
			{
				expiresIn: '8h',
			},
		);
		res.status(200).json({ token });
	} catch (err) {
		res.status(500).json({ status: 'error' });
	}
};

export default login;
