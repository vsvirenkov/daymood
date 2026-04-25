import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  content: string
}

export function getAllPosts(): Omit<BlogPost, 'content'>[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))

  return files
    .map((file) => {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
      const { data } = matter(raw)
      return {
        slug,
        title: data['title'] as string,
        description: data['description'] as string,
        date: data['date'] as string,
        readTime: data['readTime'] as string,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data['title'] as string,
    description: data['description'] as string,
    date: data['date'] as string,
    readTime: data['readTime'] as string,
    content,
  }
}