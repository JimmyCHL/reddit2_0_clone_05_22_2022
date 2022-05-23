import React from 'react'
import { useRouter } from 'next/router'
import { GET_POST_BY_POST_ID } from '../../graphql/queries'
import { useQuery } from '@apollo/client'
import { Jelly } from '@uiball/loaders'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { ADD_COMMENT } from '../../graphql/mutations'
import TimeAgo from 'react-timeago'

import PostComponent from '../../components/Post'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Avatar from '../../components/Avatar'

type FormData = {
  comment: string
}

const PostPage = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [
      {
        query: GET_POST_BY_POST_ID,
        variables: { post_id: router.query.postId },
      },
    ],
  })
  const { data } = useQuery(GET_POST_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  })

  const post: Post = data?.getPostByPostId

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    //console.log(data)
    const notification = toast.loading('Creating new comment...')

    await addComment({
      variables: {
        post_id: router.query.postId,
        text: data.comment,
        username: session?.user?.name,
      },
    })

    setValue('comment', '')

    toast.success('Comment Successfully Created!', {
      id: notification,
    })
  }

  console.log(data)

  if (!post)
    return (
      <div className="flex w-full items-center justify-center p-10 text-xl">
        <Jelly size={50} color="#FF4501" />
      </div>
    )

  return (
    <div className="mx-auto my-7 max-w-5xl">
      <PostComponent post={post} />

      <div className="-mt-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-5 pl-16 ">
        <p className="text-sm">
          Comment as <span className="text-red-500">{session?.user?.name}</span>
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-2"
        >
          <textarea
            {...register('comment', { required: true })}
            disabled={!session}
            className="h-24 w-full rounded-md border border-gray-200 p-2 pl-4 outline-none disabled:bg-gray-50"
            placeholder={
              session
                ? 'What is your thoughts?'
                : 'Please sign in to comment out!'
            }
          />
          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.comment?.type === 'required' && (
                <p>- Comment is required</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!session}
            className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
          >
            Comment
          </button>
        </form>
      </div>

      <div className="-mt-5 rounded-b-md border border-t-0 border-gray-300 bg-white py-5 px-10">
        <hr className="py-2" />

        {post?.comments.map((comment) => (
          <div
            className="relative flex items-center space-x-2 "
            key={comment.id}
          >
            <hr className="absolute top-10 left-7 z-0 h-16 border border-slate-200 " />
            <div className="z-50">
              <Avatar seed={comment.username} />
            </div>
            <div className="mt-5 flex flex-col">
              <p className="text-sx py-2 text-gray-400">
                <span className="font-semi-bold text-gray-600">
                  {comment.username}
                </span>{' '}
                &bull; <TimeAgo date={comment.created_at} />
              </p>
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PostPage
