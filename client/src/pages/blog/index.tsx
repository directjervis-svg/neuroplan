import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function BlogIndex() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog NeuroExecução</h1>
      {isLoading ? (
        <p>Carregando posts...</p>
      ) : (
        <div className="space-y-8">
          {posts?.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <a className="block p-6 border rounded-lg hover:bg-gray-50">
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-600">{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
