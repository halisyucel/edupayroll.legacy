import Snackbar from '../components/snackbar';
import { setToken } from '../redux/features/account';
import { store } from '../redux/store';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import 'rsuite/dist/rsuite.min.css';

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	useEffect(() => {
		if (router.pathname !== '/') {
			const token = localStorage.getItem('token');
			if (!token) {
				router.push('/');
				return;
			}
			store.dispatch(setToken(token));
		}
	}, [router]);
	return (
		<Provider store={store}>
			<Helmet>
				<title>Ek Ders Çizelge Uygulaması</title>
				<meta name={'robots'} content={'noindex, nofollow'} />
			</Helmet>
			<NextNProgress height={5} />
			<Component {...pageProps} />
			<Snackbar />
		</Provider>
	);
}

export default MyApp;
