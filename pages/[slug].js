import Layout from '@/layouts/layout'
import { getAllPosts, getPostBlocks } from '@/lib/notion'
import BLOG from '@/blog.config'
import { createHash } from 'crypto'
import { ReactCusdis } from 'react-cusdis'

const BlogPost = ({ post, blockMap, emailHash, slug }) => {
  if (!post) return null
  return (
    <>
      <Layout
        blockMap={blockMap}
        frontMatter={post}
        emailHash={emailHash}
        fullWidth={post.fullWidth}
      />
      <div className="max-w-2xl mx-auto py-4">
       <ReactCusdis
        attrs={{
          host: 'https://cusdis.com',
          appId: '370347dc-c7b3-4a5a-b289-4806233cd631',
          pageId: slug,
          pageTitle: slug
        }}
      />
</div>
    </>
  )
}

export async function getStaticPaths () {
  const posts = await getAllPosts({ includePages: true })
  return {
    paths: posts.map(row => `${BLOG.path}/${row.slug}`),
    fallback: true
  }
}

export async function getStaticProps ({ params: { slug } }) {
  const posts = await getAllPosts({ includePages: true })
  const post = posts.find(t => t.slug === slug)
  const blockMap = await getPostBlocks(post.id)
  const emailHash = createHash('md5')
    .update(BLOG.email)
    .digest('hex')
    .trim()
    .toLowerCase()

  Object.entries(blockMap.block).forEach(([key, value]) => {
    const createUser = [
      '‣',
      [
        [
          'u',
          value.value.created_by_id
        ]
      ]]
    const title = value.value?.properties?.title
    if (Array.isArray(title)) {
      title.push(createUser)
    }
  })

  return {
    props: { post, blockMap, emailHash, slug },
    revalidate: 1
  }
}

export default BlogPost
