export interface Row {
	id: number;
	documentID: number;
	teacherID: number;
	courseCode: number;
	teacherIdentityNumber: string;
	teacherName: string;
	teacherBranch: string;
	teacherInformation: string;
	days: string;
}

export const MonthData = [
	{
		label: 'Ocak',
		value: 0,
	},
	{
		label: 'Şubat',
		value: 1,
	},
	{
		label: 'Mart',
		value: 2,
	},
	{
		label: 'Nisan',
		value: 3,
	},
	{
		label: 'Mayıs',
		value: 4,
	},
	{
		label: 'Haziran',
		value: 5,
	},
	{
		label: 'Temmuz',
		value: 6,
	},
	{
		label: 'Ağustos',
		value: 7,
	},
	{
		label: 'Eylül',
		value: 8,
	},
	{
		label: 'Ekim',
		value: 9,
	},
	{
		label: 'Kasım',
		value: 10,
	},
	{
		label: 'Aralık',
		value: 11,
	},
];

export const getYearData = () => {
	const yearData = [];
	for (let i = 2018; i < 2040; i++) {
		yearData.push({
			value: i,
			label: i.toString(),
		});
	}
	return yearData;
};

export const fillDocumentRows = () => {
	setTimeout(() => {
		const documentRows = Array.from(document.querySelectorAll('.document-row')).filter(
			(row) => {
				return row.getAttribute('data-hidden') !== 'true';
			},
		);
		for (let i = 0; i < documentRows.length; i++) {
			const row = documentRows[i] as HTMLElement;
			if (i % 2 === 1) row.style.backgroundColor = 'transparent';
			else row.style.backgroundColor = 'rgba(52,152,255,0.1)';
		}
	}, 100);
};

export const CourseCodes = [
	{
		label: 'Gündüz',
		value: 101,
		excel: 'Gündüz'
	},
	{
		label: 'Gece',
		value: 102,
		excel: 'Gece'
	},
	{
		label: '%25 Fazla Gündüz',
		value: 103,
		excel: '%25 Fazla Gündüz'
	},
	{
		label: '%25 Fazla Gece',
		value: 104,
		excel: '%25 Fazla Gece'
	},
	{
		label: 'Belleticilik',
		value: 106,
		excel: 'Belleticilik'
	},
	{
		label: 'Sınav Görevi',
		value: 107,
		excel: 'Sınav Görevi'
	},
	{
		label: 'Egzersiz',
		value: 108,
		excel: 'Egzersiz'
	},
	{
		label: 'Hizmetiçi',
		value: 109,
		excel: 'Hizmetiçi'
	},
	{
		label: 'EDYGG-Gündüz',
		value: 110,
		excel: 'Ek Ders Yerine Geçen Gündüz'
	},
	{
		label: 'EDYGG-Gece',
		value: 111,
		excel: 'Ek Ders Yerine Geçen Gece'
	},
	{
		label: 'EDYGG - %25 Gündüz',
		value: 112,
		excel: 'Ek Ders Yerine Geçen %25 Gündüz'
	},
	{
		label: 'EYGG - %25 Gece',
		value: 113,
		excel: 'Ek Ders Yerine Geçen %25 Gece'
	},
	{
		label: 'Atış Eğitimi',
		value: 114,
		excel: 'Atış Eğitimi'
	},
	{
		label: 'Cezaevleri Eğitim Merkezi - 160*Saat',
		value: 115,
		excel: 'Cezaevleri Eğitim Merkezi - 160*Saat'
	},
	{
		label: 'Takviye Kursu (Gündüz)',
		value: 116,
		excel: 'Takviye Kursu (Gündüz)'
	},
	{
		label: 'Takviye Kursu (Gece-Haftasonu)',
		value: 117,
		excel: 'Takviye Kursu (Gece/Haftasonu)'
	},
	{
		label: 'Belleticilik %25 Fazla',
		value: 118,
		excel: 'Belleticilik %25 Fazla'
	},
	{
		label: 'Nöbet Görevi',
		value: 119,
		excel: 'Nöbet Görevi'
	},
	{
		label: 'Salon Başkanı',
		value: 1070,
		excel: 'Salon Başkanı'
	},
	{
		label: 'Gözetmen',
		value: 10700,
		excel: 'Gözetmen'
	},
	{
		label: 'Yedek Gözetmen',
		value: 107000,
		excel: 'Yedek Gözetmen'
	},
	{
		label: 'Yedek Engelli Gözetmen',
		value: 1070000,
		excel: 'Yedek Engelli Gözetmen'
	},
	{
		label: 'Nöbet Ücreti % 25 Fazla',
		value: 121,
		excel: 'Nöbet Ücreti % 25 Fazla'
	},
	{
		label: 'İYEP-Gündüz',
		value: 122,
		excel: 'İYEP - Gündüz'
	},
	{
		label: 'İYEP-Gece-Haftasonu',
		value: 123,
		excel: 'İYEP - Gece/Haftasonu'
	},
	{
		label: 'Gündüz (2-3 AFAD Eğt.Yard.)',
		value: 212,
		excel: 'Gündüz (2/3-AFAD Eğt.Yard.)'
	},
];

export const isWeekend = (day: number, month: number, year: number) => {
	const date = new Date(year, month, day);
	return date.getDay() === 6 || date.getDay() === 0;
};

export const getDaysInMonth = (month: number, year: number) => {
	return new Date(year, (month+1), 0).getDate()
};

export const regenerateTwoDigitMonth = (month: number) => {
	month += 1;
	return month < 10 ? `0${month}` : `${month}`;
};

export const getTotalRows = (days: number[]) => {
	let totalDays = 0;
	for (const day of days) totalDays += day;
	return totalDays;
};

export const getTotalDays = (documentRows: Row[]) => {
	const days: number[] = [];
	for (const row of documentRows) days.push(getTotalRows(JSON.parse(row.days)));
	return getTotalRows(days);
};

export const distinctCourseCodes = (documentRows: Row[]) => {
	const courseCodes: number[] = [];
	for (const row of documentRows)
		if (!courseCodes.includes(row.courseCode)) courseCodes.push(row.courseCode);
	return courseCodes.sort((a, b) => a - b);
};
