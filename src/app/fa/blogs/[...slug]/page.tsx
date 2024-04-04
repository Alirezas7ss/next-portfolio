import { notFound } from "next/navigation";

import "@/styles/mdx.css";

import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { env } from "@/env.js";
import { redis } from "@/lib/redis";
import { absoluteUrl, calculateReadingTime, cn, formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DigitC } from "@/components/Digit";

import BlogView from "../_components/BlogView";
import { ChevronLeft } from "lucide-react";
import { Mdx } from "@/components/mdx/mdx-components";

interface PostPageProps {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: any) {
  const slug = params?.slug?.join("/");
  const post = allPosts.find((post) => post.slugAsParams === slug);

  if (!post) {
    return null;
  }

  return post;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPostFromParams(params);

  if (!post) {
    return {};
  }

  const url = env.NEXT_PUBLIC_APP_URL;

  const ogUrl = new URL(`${url}/api/og`);
  ogUrl.searchParams.set("heading", post.title);
  ogUrl.searchParams.set("type", "Blog Post");
  ogUrl.searchParams.set("mode", "dark");

  return {
    title: post.title,
    description: post.description,
    authors: post.authors.map((author) => ({
      name: author,
    })),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: absoluteUrl(post.slug),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogUrl.toString()],
    },
  };
}

export async function generateStaticParams(): Promise<
  PostPageProps["params"][]
> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  const authors = post.authors.map((author) =>
    allAuthors.find(({ slug }) => slug === `/authors/${author}`)
  );
  const views =
    (await redis.mget<number[]>(
      ["pageviews[0]", "blog", params?.slug?.join("/")].join(":")
    )) ?? 0;
  console.log(params?.slug?.join("/"), params?.slug, views);

  return (
    <article className='container relative max-w-3xl py-6 lg:py-10'>
      <Link
        href='/blog'
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-[-200px] top-14 hidden xl:inline-flex"
        )}
      >
        See all posts
        <ChevronLeft className='mr-2 size-4' />
      </Link>
      <div>
        <h1 className='my-2 inline-block font-heading text-4xl leading-tight lg:text-5xl'>
          {post.title}
        </h1>
        <div className='flex gap-4 mt-2'>
          {post.date && (
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          )}
          <div className='flex gap-1'>
            <view />

            <div className='  overflow-hidden   px-2 text-foreground'>
              <DigitC value={views} />
            </div>
          </div>
          <p>{calculateReadingTime(post.body.code)} min read</p>
        </div>
        {authors?.length ? (
          <div className='mt-4 flex space-x-4'>
            {authors.map((author) =>
              author ? (
                <Link
                  key={author._id}
                  href={`https://twitter.com/${author.twitter}`}
                  className='flex items-center space-x-2 text-sm'
                >
                  <Image
                    src={author.avatar}
                    alt={author.title}
                    width={42}
                    height={42}
                    className='rounded-full bg-white'
                  />
                  <div className='flex-1 text-left leading-tight'>
                    <p className='font-medium'>{author.title}</p>
                    <p className='text-[12px] text-muted-foreground'>
                      @{author.twitter}
                    </p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        ) : null}
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt={post.title}
          width={720}
          height={405}
          className='my-8 rounded-md border bg-muted transition-colors'
          priority
        />
      )}
      <Mdx code={post.body.code} />
      <hr className='mt-12' />
      <div className='flex justify-center py-6 lg:py-10'>
        <Link href='/blog' className={cn(buttonVariants({ variant: "ghost" }))}>
          See all posts
          <ChevronLeft className='mr-2 size-4' />
        </Link>
      </div>
      <React.Suspense>
        <BlogView blogId={params?.slug?.join("/")} />
      </React.Suspense>
    </article>
  );
}
