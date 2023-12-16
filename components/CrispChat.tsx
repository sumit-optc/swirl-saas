"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export const CrispChat = () => {
	useEffect(() => {
		Crisp.configure("c9c4e5c0-4fce-4af2-8eda-6dd4ba94cb3b");
	}, []);

	return null;
};
