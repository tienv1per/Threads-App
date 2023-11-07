import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	community: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Community",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	parentId: {
		type: String,
	},
	children: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Thread",
		}
	],
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;

// Thread Original 
// -> Thread comment 1
// -> Thread comment 2
//   -> Thread comment 3
//   -> Thread comment 4