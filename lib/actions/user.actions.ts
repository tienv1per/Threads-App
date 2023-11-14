"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
	userId: string;
	username: string;
	name: string;
	bio: string;
	image: string;
	path: string;
};

export async function updateUser({
	userId,
	username,
	name,
	bio,
	image,
	path
}: Params): Promise<void> {
	try {
		connectToDB();

		await User.findOneAndUpdate(
			{ id: userId },
			{
				username: username.toLowerCase(),
				name,
				bio,
				image,
				onboarded: true,
			},
			{ upsert: true}
		);

		if(path === "/profile/edit"){
			revalidatePath(path);
		}
	} catch (error: any) {
		throw new Error(`Failed to create/update user: ${error.message}`);
	}
}

export async function fetchUser(userId: string){
	try {
		connectToDB();
		
		return await User
			.findOne({ id: userId })
			// .populate({
			// 	path: 'communities',
			// 	model: Community
			// })
	} catch (error: any) {
		throw new Error(`Failed to fetch user: ${error.message}`);
	}
}

export async function fetchUserPosts(userId: string){
	try {
		await connectToDB();
		// find all threads authored by user with given userId
		// todo: populate community
		const threads = await User.findOne({id: userId})
			.populate({
				path: 'threads',
				model: Thread,
				populate: {
					path: 'children',
					model: Thread,
					populate: {
						path: 'author',
						model: User,
						select: 'name image id'
					},
				},
			});
		
		return threads;
	} catch (error: any) {
		throw new Error(`Failed to fetcj user posts: ${error.message}`);
	}
}


/**
const query: FilterQuery<typeof User> = { id: {$ne: userId} };: Đầu tiên, tạo một đối tượng query là một đối tượng dùng để lọc trong truy vấn. 
Điều kiện trong trường hợp này là "id không bằng userId". Nó sẽ loại bỏ người dùng hiện tại từ kết quả truy vấn.

$ne là một toán tử trong MongoDB, có nghĩa là "không bằng". Do đó, { id: { $ne: userId } } có ý nghĩa là "lấy các bản ghi mà id không bằng userId".
if(searchString.trim() !== '') { ... }: Kiểm tra xem có chuỗi tìm kiếm không. Nếu có, thêm điều kiện tìm kiếm bằng cách sử dụng $or.

query.$or = [ { username: { $regex: regex } }, { name: { $regex: regex } } ];: Nếu có chuỗi tìm kiếm (searchString không trắng), thêm điều kiện $or vào query. 
Điều này có nghĩa là kết quả trả về sẽ chứa những người dùng mà tên người dùng hoặc tên đầy đủ (name) khớp với biểu thức chính quy (regex).

$or là một toán tử trong MongoDB, có nghĩa là "hoặc". Đối tượng $or chứa một mảng các điều kiện, và bất kỳ bản ghi nào thoả mãn ít nhất một trong các điều kiện sẽ được trả về.

{ username: { $regex: regex } }: Tìm kiếm các bản ghi mà trường username khớp với biểu thức chính quy regex.

{ name: { $regex: regex } }: Tìm kiếm các bản ghi mà trường name khớp với biểu thức chính quy regex.

Kết hợp cả hai điều kiện (id không bằng userId và tìm kiếm theo username hoặc name) giúp xây dựng một truy vấn linh hoạt và chi tiết theo yêu cầu tìm kiếm của người dùng.
 */
export async function fetchUsers({
	userId,
	searchString="",
	pageNumber=1, 
	pageSize=20,
	sortBy="desc"
} : {
	userId: string;
	searchString?: string;
	pageNumber?: number;
	pageSize?: number;
	sortBy?: SortOrder;
}){
	try {
		await connectToDB();

		const skipAmount = (pageNumber - 1) * pageSize;
		const regex = new RegExp(searchString, "i");

		const query: FilterQuery<typeof User> = {
			id: {$ne: userId},
		}

		if(searchString.trim() !== ''){
			query.$or = [
				{ username: { $regex: regex}},
				{ name: {$regex: regex}},
			]
		}

		const sortOptions = { createdAt: sortBy};
		const userQuery = User.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(pageSize);
		
			const totalUsersCount = await User.countDocuments(query);
			const users = await userQuery.exec();

			const isNext = totalUsersCount > skipAmount + users.length;

			return { users, isNext };
	} catch (error: any) {
		throw new Error(`Failed to fetch users: ${error.message}`);
	}
}

export async function getActivity(userId: string){
	try {
		await connectToDB();

		// find all threads by the user
		const userThreads = await Thread.find({author: userId});

		// collect all the child thread ids (replies) from the 'children'
		const childThreadIds = userThreads.reduce((acc, userThread) => {
			return acc.concat(userThread.children);
		}, []);

		const replies = await Thread.find({
			_id: {$in: childThreadIds},
			author: {$ne: userId}
		}).populate({
			path: 'author',
			model: User,
			select: 'name image _id'
		});

		return replies;
	} catch (error: any) {
		throw new Error(`Failed to fetch activity: ${error.message}`);
	}
}