import { getAllPostsAndSubposts, resolveLinkToId } from '@/lib/data-utils';

export async function GET() {
  const posts = await getAllPostsAndSubposts();
  
  const nodes: { id: string; name: string; val: number; group: string; color?: string }[] = [];
  const links: { source: string; target: string; value: number }[] = [];
  const tagSet = new Set<string>();
  const postIds = new Set(posts.map(p => p.id));

  // 1. Add Post Nodes and Tag Links
  for (const post of posts) {
    nodes.push({
      id: post.id,
      name: post.data.title,
      val: 2, // Larger size for posts
      group: 'post',
      color: 'rgba(255, 255, 255, 0.8)' // Default color, will be overridden by CSS/Theme potentially
    });

    if (post.data.tags) {
      for (const tag of post.data.tags) {
        tagSet.add(tag);
        links.push({
          source: post.id,
          target: `tag-${tag}`,
          value: 1
        });
      }
    }
  }

  // 2. Add Tag Nodes
  for (const tag of tagSet) {
    nodes.push({
      id: `tag-${tag}`,
      name: `#${tag}`,
      val: 1, // Smaller size for tags
      group: 'tag',
      color: '#a855f7' // Purple color for tags
    });
  }

  // 3. Add Internal Links (Post to Post)
  const normalize = (id: string) => id.endsWith('/index') ? id.replace(/\/index$/, '') : id;

  for (const post of posts) {
    const localRegex = /\[.*?\]\((.*?)\)/g;
    let match;
    
    while ((match = localRegex.exec(post.body || '')) !== null) {
      const url = match[1];
      const targetId = resolveLinkToId(url, post.id);

      if (targetId) {
        const normTarget = normalize(targetId);
        // Find matching actual post ID
        const foundId = Array.from(postIds).find(pid => normalize(pid) === normTarget);

        if (foundId && foundId !== post.id) {
            links.push({
                source: post.id,
                target: foundId,
                value: 2 // Stronger connection between posts
            });
        }
      }
    }
  }

  return new Response(JSON.stringify({ nodes, links }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}