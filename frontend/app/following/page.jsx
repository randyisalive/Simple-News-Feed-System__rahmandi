"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "../function/utils";

const FollowingPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch("/api/following");
        setList(data.following || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded">
      <h2 className="text-lg font-medium mb-4">People you follow</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-3">
          {list.map((u) => (
            <li
              key={u.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <div>{u.username}</div>
              <div>
                <FollowButton targetUserId={u.id} initialFollowing={true} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowingPage;
