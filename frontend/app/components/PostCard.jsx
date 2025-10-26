import React from "react";

const PostCard = ({ post }) => {
  return (
    <div className="p-4 border-b bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{post.username}</div>
          <div className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">id: {post.id}</div>
        </div>
      </div>
      <p className="mt-3 mb-3">{post.content}</p>

      <div className="flex gap-4 text-sm text-gray-600">
        <button className="hover:underline">Like ({post.likes || 0})</button>
        <button className="hover:underline">Comment</button>
        <button className="hover:underline">Share</button>
      </div>
    </div>
  );
};

export default PostCard;
