export const isNumeric = (text: string) => {
	if (typeof text != 'string') return false;
	return !isNaN(parseFloat(text));
};
