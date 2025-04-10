
// Button component for consistent styling
import React from "react";
import {cn} from "@/lib/utils";
import {LoaderCircle} from "lucide-react";

export interface ButtonProps {
	onClick: () => void;
	loading?: boolean;
	className?: string;
	children: React.ReactNode;
	loadingText?: string;
	disabled?: boolean;
}

export function Button({onClick, loading, className, children, loadingText = "Chargement...", disabled}: ButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={loading || disabled}
			className={cn(
				"cursor-pointer flex justify-center items-center gap-2.5",
				"w-full py-4 rounded-lg",
				"font-semibold transition duration-200 ease-in-out",
				loading || disabled ? "opacity-50 pointer-events-none" : "",
				className
			)}
		>
			{loading ? (
				<>
					<LoaderCircle className="w-4 h-4 animate-spin"/> {loadingText}
				</>
			) : (
				children
			)}
		</button>
	)
}
