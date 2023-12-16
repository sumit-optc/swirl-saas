"use client";

import axios from "axios";
import * as z from "zod";
import Heading from "@/components/Heading";
import { Code } from "lucide-react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";

import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import Empty from "@/components/Empty";
import Loader from "@/components/Loader";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";
import BotAvatar from "@/components/BotAvatar";
import { useProModel } from "@/hooks/useProModel";
import toast from "react-hot-toast";

export default function CodePage() {
	const proModel = useProModel();
	const router = useRouter();
	const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			prompt: "",
		},
	});

	const isLoading = form.formState.isSubmitting;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const userMessage: ChatCompletionMessageParam = {
				role: "user",
				content: values.prompt,
			};
			const newMessages = [...messages, userMessage];

			const response = await axios.post("/api/code", {
				messages: newMessages,
			});

			setMessages((current) => [...current, userMessage, response.data]);

			form.reset();
		} catch (error: any) {
			if (error?.response?.status === 403) {
				proModel.onOpen();
			} else {
				toast.error("Something went wrong");
			}
		} finally {
			router.refresh();
		}
	};

	return (
		<div>
			<Heading
				title='Code Generation'
				description='AI Code Generation model'
				icon={Code}
				iconColor='text-green-700'
				bgColor='bg-green-700/10'
			/>
			<div className='px-4 lg:px-8'>
				<div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2'>
							<FormField
								name='prompt'
								render={({ field }) => (
									<FormItem className='col-span-12 lg:col-span-10'>
										<FormControl className='m-0 p-0'>
											<Input
												className='border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent'
												disabled={isLoading}
												placeholder='Print prime numbers up to given value'
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<Button
								className='col-span-12 lg:col-span-2 w-full'
								disabled={isLoading}>
								Generate
							</Button>
						</form>
					</Form>
				</div>
				<div className='space-y-4 mt-4'>
					{messages.length === 0 && !isLoading && (
						<div>
							<Empty label='No conversation started.' />
						</div>
					)}
					<div className='flex flex-col-reverse gap-y-4'>
						{messages.toReversed().map((message) => {
							const obj: any = message;
							return (
								<div
									key={obj.content}
									className={cn(
										"p-8 w-full flex items-start gap-x-8 rounded-lg",
										message.role === "user"
											? "bg-white border border-black/10"
											: "bg-muted"
									)}>
									{message.role === "user" ? <UserAvatar /> : <BotAvatar />}
									<ReactMarkdown
										components={{
											pre: ({ node, ...props }) => (
												<div className='overflow-auto w-full my-2 bg-violet-500/10 p-2 rounded-lg'>
													<pre {...props} />
												</div>
											),
											code: ({ node, ...props }) => (
												<code
													className='bg-violet-500/10 rounded-lg p-1'
													{...props}
												/>
											),
										}}
										className='text-sm overflow-hidden leading-7'>
										{obj.content || ""}
									</ReactMarkdown>
								</div>
							);
						})}
					</div>
					{isLoading && (
						<div className='p-8 rounded-lg w-full flex items-center justify-center bg-muted'>
							<Loader />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
