import { trpc } from "@/lib/trpc";
import { useRouter } from "wouter";

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.match[1];
  const { data: post, isLoading } = trpc.blog.get.useQuery({ slug });

  if (isLoading) {
    return <p>Carregando post...</p>;
  }

  if (!post) {
    return <p>Post não encontrado.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
