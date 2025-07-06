import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CreateIdeaForm } from "@/components/ideas/create-idea-form"

export default async function EditIdeaPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    include: {
      attachments: true,
    },
  })

  if (!idea) {
    notFound()
  }

  // Check if the current user is the author of the idea
  if (idea.authorId !== session.user.id) {
    redirect("/ideas")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Idea</h1>
      <CreateIdeaForm 
        isEditing={true}
        initialData={{
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          tags: idea.tags,
          media: idea.attachments.map(m => ({
            id: m.id,
            url: m.url,
            type: m.type
          }))
        }}
      />
    </div>
  )
} 