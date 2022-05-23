import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { LinkIcon, PhotographIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'

import Avatar from '../components/Avatar'
import { ADD_POST, ADD_SUBREDDIT } from '../graphql/mutations'
import client from '../apolloClient'
import { GET_ALL_POSTS, GET_SUBREDDIT_BY_TOPIC } from '../graphql/queries'
import toast from 'react-hot-toast'

type formData = {
  postTitle: string
  postBody: string
  postImage: string
  subreddit: string
}

type Props = {
  subreddit?: string
}

const PostBox = ({ subreddit }: Props) => {
  const { data: session } = useSession()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formData>()
  const [imageBoxOpen, setImageBoxOpen] = useState<Boolean>(false)
  const [addPost] = useMutation(ADD_POST, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
  })
  const [addSubreddit] = useMutation(ADD_SUBREDDIT)

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData)

    const notification = toast.loading('Creating new post...')

    try {
      //Query for the subreddit topic...
      const {
        data: { getSubredditListByTopic },
      } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: subreddit || formData.subreddit,
        },
      })

      const subredditExists = getSubredditListByTopic.length > 0
      if (!subredditExists) {
        //create subreddit...
        console.log('Subreddit is new! -> creating a NEW subreddit!')
        const {
          data: { insertSubreddit: newSubreddit },
        } = await addSubreddit({
          variables: {
            topic: subreddit || formData.subreddit,
          },
        })

        console.log('Creating post...', formData)

        //image can not be undefined or null in the graphql.
        const image = formData.postImage || ''

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            title: formData.postTitle,
            subreddit_id: newSubreddit.id,
            username: session?.user?.name,
          },
        })
        console.log('New post added', newPost)
      } else {
        // use existing subreddit...
        console.log('Using existing subreddit!')
        console.log(getSubredditListByTopic)

        const image = formData.postImage || ''

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            title: formData.postTitle,
            subreddit_id: getSubredditListByTopic[0].id,
            username: session?.user?.name,
          },
        })
        console.log('New post added', newPost)
      }

      //After the post has been added!

      setValue('postTitle', '')
      setValue('postBody', '')
      setValue('postImage', '')
      setValue('subreddit', '')

      toast.success('New post added!', {
        id: notification,
      })
    } catch (error) {
      console.log(error)
      toast.error('Woops, something went wrong!', { id: notification })
    }
  })

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-20 z-50 rounded-md border border-gray-300 bg-white p-2"
    >
      <div className="flex items-center space-x-3">
        <Avatar />
        <input
          {...register('postTitle', { required: true })}
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
          type="text"
          placeholder={
            session
              ? subreddit
                ? `Create a post in r/${subreddit}`
                : 'Create a post by entering a title!'
              : 'Sign in to post'
          }
        />
        <PhotographIcon
          onClick={session ? () => setImageBoxOpen((prev) => !prev) : undefined}
          className={`h-6 cursor-pointer text-gray-300 ${
            !session && 'pointer-events-none'
          } ${imageBoxOpen && 'text-blue-300'}`}
        />
        <LinkIcon className="h-6 text-gray-300" />
      </div>
      {!!watch('postTitle') && (
        <div className="flex flex-col py-2">
          {/* Body */}
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body</p>
            <input
              {...register('postBody')}
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              type="text"
              placeholder="Text (optional)"
            />
          </div>

          {!subreddit && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Subreddit</p>
              <input
                {...register('subreddit', { required: true })}
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="text"
                placeholder="i.e. reactjs"
              />
            </div>
          )}

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">ImageURL:</p>
              <input
                {...register('postImage')}
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="text"
                placeholder="optional"
              />
            </div>
          )}

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle?.type === 'required' && (
                <p>- A Post Title is required</p>
              )}
              {errors.subreddit?.type === 'required' && (
                <p>- A Subreddit is required</p>
              )}
            </div>
          )}
        </div>
      )}
      {!!watch('postTitle') && (
        <button
          type="submit"
          className="mx-auto w-full rounded-full bg-blue-400 p-2 text-white "
        >
          Create Post
        </button>
      )}
    </form>
  )
}

export default PostBox
