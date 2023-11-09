"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/thread";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface CommentProps {
	threadId: string;
	currentUserImg: string;
	currentUserId: string;
}

const Comment = ({threadId, currentUserImg, currentUserId}: CommentProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const form = useForm<z.infer<typeof CommentValidation>>({
		resolver: zodResolver(CommentValidation),
		defaultValues: {
			thread: '',
		},
	});

	const onSubmit = async(values: z.infer<typeof CommentValidation>) => {
		// backend action
		await addCommentToThread({
			threadId: threadId,
			userId: JSON.parse(currentUserId),
			commentText: values.thread,
			path: pathname
		});

		form.reset();
	};

  return (
    <Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="comment-form"
			>
				<FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel>
								<Image
									src={currentUserImg}
									alt="Profile Image"
									width={48}
									height={48}
									className="rounded-full object-cover"
								/>
							</FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input 
									type="text"
									placeholder="Comment..."
									className="no-focus text-light-1 outline-none"
									{...field}
								/>
              </FormControl>
            </FormItem>
          )}
        />
				<Button
					type="submit"
					className="comment-form_btn"
				>
					Reply
				</Button>
			</form>
		</Form>
  );
};

export default Comment;