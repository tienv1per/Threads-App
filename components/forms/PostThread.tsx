"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button"
import {Form,
  FormControl,
  FormField,
  FormItem,
	FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { ThreadValidation } from "@/lib/validations/thread";

interface Props {
  user: {
		id: string;
		objectId: string;
		username: string;
		name: string;
		bio: string;
		image: string;
	};
	btnTitle: string;
};

const PostThread = ({ userId }: {userId: string}) => {
	const pathname = usePathname();
	const router = useRouter();

	const form = useForm<z.infer<typeof ThreadValidation>>({
		resolver: zodResolver(ThreadValidation),
		defaultValues: {
			thread: '',
			accountId: userId
		},
	});

	const onSubmit = async() => {
		// backend action
		//await createThread();
	};

  return (
    <Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mt-10 flex flex-col justify-start gap-10"
			>
				<FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
								Content
							</FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea 
									rows={15}
									{...field}
								/>
              </FormControl>
							<FormMessage/>
            </FormItem>
          )}
        />
				<Button
					type="submit"
					className="bg-primary-500"
				>
					Post Thread
				</Button>
			</form>

		</Form>
  );
};

export default PostThread;