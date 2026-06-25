import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => {
	return (
		<SonnerToaster
			position="top-right"
			richColors
			closeButton
			toastOptions={{
				style: {
					fontSize: "14px",
				},
			}}
		/>
	);
};
