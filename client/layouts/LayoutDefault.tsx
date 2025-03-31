import "./style.css";

import "./tailwind.css";

import React, {useEffect} from "react";
import logoUrl from "../assets/logo.svg";
import {useData} from "vike-react/useData";
import {BaseData} from "@/pages/types";

export default function LayoutDefault({children}: { children: React.ReactNode }) {
	return (
		<>
			<Header/>
			<main>
				{children}
			</main>
			<Footer/>
		</>
	);
}

function Header() {
	return (
		<div className="max-w-screen-2xl mx-auto my-8">
			<div className="mx-4">
				<a href="/">
					<img className="h-12 w-auto" src={logoUrl} alt="Logo Assmac" />
				</a>
			</div>
		</div>
	);
}

function Footer() {
	const d = useData<BaseData>()

	const [additionalPaddingDueToStickyButton, setAdditionalPaddingDueToStickyButton] = React.useState(0);

	useEffect(() => {
		const checkStickyButton = () => {
			const stickyButton = document.getElementById('sticky-button-buy');
			console.log("checkStickyButton", stickyButton);

			if (stickyButton) {
				const stickyButtonHeight = stickyButton.getBoundingClientRect().height;
				console.log("stickyButtonHeight", stickyButtonHeight);
				setAdditionalPaddingDueToStickyButton(stickyButtonHeight);
			} else {
				console.log("stickyButton not found");
				setAdditionalPaddingDueToStickyButton(0);
			}
		};

		checkStickyButton();

		const observer = new MutationObserver(() => {
			checkStickyButton();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		// Window load event can still be useful for images and other resources
		window.addEventListener('load', checkStickyButton);

		return () => {
			observer.disconnect();
			window.removeEventListener('load', checkStickyButton);
		};
	}, []);

	return (
		<footer id="footer" className="bg-emerald-700 w-full py-8" style={additionalPaddingDueToStickyButton > 0 ? { paddingBottom: `${additionalPaddingDueToStickyButton+24}px` } : {}}>
			<div className="max-w-screen-lg mx-auto px-6 w-full">
				<div className="flex flex-col md:flex-row md:justify-between gap-6">
					<div className="text-white text-sm">
						© Assmac {new Date().getFullYear()}
					</div>

					<div className="flex flex-col md:flex-row gap-4 md:gap-8">
						<a href="/cgv" className="text-white text-sm hover:text-emerald-200 transition-colors">
							Conditions générales de vente
						</a>
						<a href="/mention-legales" className="text-white text-sm hover:text-emerald-200 transition-colors">
							Mentions légales
						</a>
					</div>

					<div className="flex items-center">
						<a href={d.setting.instagram} target="_blank" className="h-6 w-6 text-white hover:text-emerald-200 transition-colors">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M13.028 2.00099C13.7577 1.99819 14.4875 2.00552 15.217 2.02299L15.411 2.02999C15.635 2.03799 15.856 2.04799 16.123 2.05999C17.187 2.10999 17.913 2.27799 18.55 2.52499C19.21 2.77899 19.766 3.12299 20.322 3.67899C20.8304 4.17859 21.2238 4.78293 21.475 5.44999C21.722 6.08699 21.89 6.81399 21.94 7.87799C21.952 8.14399 21.962 8.36599 21.97 8.58999L21.976 8.78399C21.9938 9.51318 22.0014 10.2426 21.999 10.972L22 11.718V13.028C22.0025 13.7577 21.9948 14.4875 21.977 15.217L21.971 15.411C21.963 15.635 21.953 15.856 21.941 16.123C21.891 17.187 21.721 17.913 21.475 18.55C21.2246 19.2177 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2237 18.55 21.475C17.913 21.722 17.187 21.89 16.123 21.94C15.856 21.952 15.635 21.962 15.411 21.97L15.217 21.976C14.4875 21.9938 13.7577 22.0014 13.028 21.999L12.282 22H10.973C10.2433 22.0025 9.51352 21.9948 8.784 21.977L8.59 21.971C8.35261 21.9624 8.11527 21.9524 7.878 21.941C6.814 21.891 6.088 21.721 5.45 21.475C4.78268 21.2243 4.17823 20.8308 3.679 20.322C3.17004 19.8223 2.77622 19.2175 2.525 18.55C2.278 17.913 2.11 17.187 2.06 16.123C2.04886 15.8857 2.03886 15.6484 2.03 15.411L2.025 15.217C2.00656 14.4875 1.99823 13.7577 2 13.028V10.972C1.99721 10.2426 2.00454 9.51318 2.022 8.78399L2.029 8.58999C2.037 8.36599 2.047 8.14399 2.059 7.87799C2.109 6.81299 2.277 6.08799 2.524 5.44999C2.77537 4.78261 3.16996 4.17843 3.68 3.67999C4.17889 3.17074 4.78296 2.77656 5.45 2.52499C6.088 2.27799 6.813 2.10999 7.878 2.05999L8.59 2.02999L8.784 2.02499C9.51318 2.00656 10.2426 1.99823 10.972 1.99999L13.028 2.00099ZM12 7.00099C11.3375 6.99162 10.6798 7.11401 10.065 7.36105C9.45019 7.6081 8.89064 7.97486 8.41884 8.44004C7.94704 8.90522 7.5724 9.45952 7.31668 10.0707C7.06097 10.682 6.92929 11.3379 6.92929 12.0005C6.92929 12.663 7.06097 13.319 7.31668 13.9302C7.5724 14.5414 7.94704 15.0958 8.41884 15.5609C8.89064 16.0261 9.45019 16.3929 10.065 16.6399C10.6798 16.887 11.3375 17.0094 12 17C13.3261 17 14.5978 16.4732 15.5355 15.5355C16.4732 14.5978 17 13.3261 17 12C17 10.6739 16.4732 9.40213 15.5355 8.46445C14.5978 7.52677 13.3261 7.00099 12 7.00099ZM12 9.00099C12.3985 8.99364 12.7945 9.06578 13.1648 9.21319C13.5351 9.3606 13.8723 9.58033 14.1568 9.85953C14.4412 10.1387 14.6672 10.4718 14.8214 10.8393C14.9757 11.2068 15.0552 11.6014 15.0553 12C15.0553 12.3986 14.976 12.7931 14.8218 13.1607C14.6677 13.5283 14.4418 13.8614 14.1575 14.1407C13.8731 14.42 13.536 14.6399 13.1657 14.7874C12.7955 14.9349 12.3995 15.0072 12.001 15C11.2053 15 10.4423 14.6839 9.87968 14.1213C9.31707 13.5587 9.001 12.7956 9.001 12C9.001 11.2043 9.31707 10.4413 9.87968 9.87867C10.4423 9.31606 11.2053 8.99999 12.001 8.99999L12 9.00099ZM17.25 5.50099C16.9274 5.5139 16.6223 5.65114 16.3986 5.88396C16.1749 6.11678 16.05 6.42712 16.05 6.74999C16.05 7.07285 16.1749 7.38319 16.3986 7.61601C16.6223 7.84884 16.9274 7.98607 17.25 7.99899C17.5815 7.99899 17.8995 7.86729 18.1339 7.63287C18.3683 7.39845 18.5 7.08051 18.5 6.74899C18.5 6.41747 18.3683 6.09952 18.1339 5.8651C17.8995 5.63068 17.5815 5.49899 17.25 5.49899V5.50099Z"
											fill="currentColor"/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
