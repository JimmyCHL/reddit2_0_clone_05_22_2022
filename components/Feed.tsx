import React from 'react'

import { useQuery } from '@apollo/client'
import { GET_ALL_POSTS, GET_ALL_POSTS_BY_TOPIC } from '../graphql/queries'
import PostComponent from '../components/Post'

type Props = {
  topic?: string
}
const Feed = ({ topic }: Props) => {
  // console.log(topic)
  const { data, loading, error } = !topic
    ? useQuery(GET_ALL_POSTS)
    : useQuery(GET_ALL_POSTS_BY_TOPIC, {
        variables: {
          topic: topic,
        },
      })

  const posts: Post[] = !topic ? data?.getPostList : data?.getPostListByTopic

  return (
    <div className="mt-5 space-y-4">
      {posts?.map((post) => (
        <PostComponent key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Feed
