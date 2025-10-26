import React from "react";

const PostForm = () => {
  return (
    <div className="sticky top-0 bg-white z-30 p-4 border-b">
      <Toast message={toast} onClose={() => setToast("")} />
      <form onSubmit={submit} className="max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={200}
            className="flex-1 border rounded p-3 h-20 resize-none"
          />
          <div className="w-40 text-right">
            <div className="text-sm text-gray-500">{count}/200</div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
