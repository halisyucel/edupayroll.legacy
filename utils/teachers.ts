export const fillTeacherRows = () => {
	setTimeout(() => {
		const teacherRows = Array.from(document.querySelectorAll('.teacher-row')).filter((row) => {
			return row.getAttribute('data-hidden') !== 'true';
		});
		for (let i = 0; i < teacherRows.length; i++) {
			const row = teacherRows[i] as HTMLElement;
			if (i % 2 === 1) row.style.backgroundColor = 'transparent';
			else row.style.backgroundColor = 'rgba(52,152,255,0.1)';
		}
	}, 100);
};
