"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
	author: string;
	communityId: string | null;
	path: string;
};

export async function createThread({
	text,
	author,
	communityId,
	path
}: Params){
	try {
		connectToDB();
		const createdThread = await Thread.create({
			text,
			author, 
			community: null,
		});

		//update user model, add thread already created to array threads of user
		await User.findByIdAndUpdate(author, {
			$push: {threads: createdThread._id}
		});

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error creating thread ${error.message}`);
	}
};

export async function fetchPosts(pageNumber=1, pageSize=20){
	connectToDB();
	// calculate number of posts to skip
	const skipAmount = (pageNumber - 1) * pageSize;

	// fetch posts have no parents (top-level threads)
	const postsQuery = Thread.find({parentId: {$in: [null, undefined]}})
		.sort({createdAt: 'desc'})
		.skip(skipAmount)
		.limit(pageSize)
		.populate({path: 'author', model: User})
		.populate({
			path: 'children',
			populate: {   // get id name image of comment of this post
				path: 'author',
				model: User,
				select: "_id name parentId image"
			}
		});
	
		// get the total count of posts
	const totalPostsCount = await Thread.countDocuments({ parentId: {$in: [null, undefined]}});

	const posts = await postsQuery.exec();
	
	// check xem con` post khong de load 
	const isNext = totalPostsCount > skipAmount + posts.length;

	return { posts, isNext };
};