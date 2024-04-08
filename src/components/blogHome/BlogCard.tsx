"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Post {
  title: string;
  image: string;
  slug: string;
  description: string;
  date: string;
}
interface Props {
  post: Post;
}
function BlogCard({ post }: Props) {
  console.log(post);

  return (
    <div className=' group relative  z-20 flex overflow-hidden text-brand-foreground'>
      <div className='z-20 relative overflow-hidden'>
        <div className='absolute inset-0 z-10 -translate-x-full bg-transparent bg-gradient-to-r from-transparent via-brand-foreground bg-clip-border group-hover:translate-x-full group-hover:transition group-hover:duration-1000' />
        <div className='m-[1px] flex h-fit w-fit items-center justify-center border-2 border-accent bg-brand rounded-md'>
          <div className='m-5  h-[320px] w-[250px] flex flex-col  gap-2 '>
            <div className='relative flex aspect-video  w-full items-center justify-center rounded-md'>
              <Image
                src={`${post.image}`}
                alt={post.title}
                width={800}
                height={1200}
                className='absolute inset-0 size-full  object-cover'
              />
              {/* {post?.content?.weddings[0]?.image} */}
            </div>
            <h2 className='text-2xl mt-2 font-extrabold'>{post.title}</h2>
            {post.description && (
              <span className='text-muted-foreground'>{post.description}</span>
            )}
            {post.date && (
              <span className='text-sm text-muted-foreground'>
                {formatDate(post.date)}
              </span>
            )}
          </div>
        </div>
      </div>
      <Link href={post.slug} className='z-30 absolute inset-0'>
        <span className='sr-only'>View Article</span>
      </Link>
    </div>
  );
}

export default BlogCard;
