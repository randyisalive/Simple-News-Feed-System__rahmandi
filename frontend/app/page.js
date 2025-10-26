"use client";
import { useRouter } from "next/navigation";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u =
      typeof window !== "undefined"
        ? JSON.parse(
            sessionStorage.getItem(process.env.NEXT_PUBLIC_TOKEN) || "null"
          )
        : null;
    setUser(u);
  }, []);

  const handleAuth = (data) => {
    // store user and redirect to feed
    const u = { id: data.id, username: data.username };
    sessionStorage.setItem(process.env.NEXT_PUBLIC_TOKEN, JSON.stringify(u));
    setUser(u);
    router.push("/"); // feed is home
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    router.push("/login");
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <div className="text-xl font-bold">Simple News Feed</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/following")}
              className="text-sm"
            >
              Following
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div>{user.username}</div>
                <button onClick={handleLogout} className="text-sm text-red-600">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-blue-600"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-3 gap-6 py-6">
        <aside className="col-span-1">
          <div className="sticky top-20 p-4 bg-white rounded shadow">
            <div className="font-medium">Profile</div>
            {user ? (
              <div className="mt-2">{user.username}</div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">Not logged in</div>
            )}
          </div>
        </aside>

        <section className="col-span-2">
          {user && (
            <PostForm
              onPosted={() => {
                /* parent can trigger refetch by different mechanism */ window.location.reload();
              }}
            />
          )}

          <div className="mt-4">
            <PostList />
          </div>
        </section>
      </main>
    </div>
  );
}
