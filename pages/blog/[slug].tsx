import React, { FC } from 'react';
import hydrate from 'next-mdx-remote/hydrate';
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Post } from '../../types';
import Container from '../../components/container';
import HomeNav from '../../components/homeNav';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { posts } from '../../content';
import renderToString from 'next-mdx-remote/render-to-string';

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  const content = hydrate(source);
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    );
  }
  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content}</Pane>
        </Container>
      </main>
    </Pane>
  );
};

BlogPost.defaultProps = {
  source: '',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
};

// because path is dynamic ([slug]) we need to know it during build time
export function getStaticPaths() {
  const postsPath = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsPath);
  const postsContent = filenames.map((name) => {
    const filePath = path.join(postsPath, name);
    const file = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(file);
    return data;
  });

  return {
    paths: postsContent.map((p) => ({
      params: {
        slug: p.slug,
      },
    })),
    // generate the page on the fly and cache it if it's not found / pre-generated
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  let post;
  try {
    const filePath = path.join(process.cwd(), 'posts', `${params.slug}.mdx`);
    post = fs.readFileSync(filePath, 'utf-8');
  } catch {
    const cmsPosts = posts.published.map((p) => matter(p));

    const match = cmsPosts.find((p) => p.data.slug === params.slug);
    post = match.content;
  }

  const { data } = matter(post);
  const mdxSource = await renderToString(post, { scope: data });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  };
}

export default BlogPost;
