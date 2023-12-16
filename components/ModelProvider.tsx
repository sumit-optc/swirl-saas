"use client";

import { useEffect, useState } from "react";
import ProModel from "./ProModel";

export default function ModelProvider() {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	return (
		<>
			<ProModel />
		</>
	);
}
