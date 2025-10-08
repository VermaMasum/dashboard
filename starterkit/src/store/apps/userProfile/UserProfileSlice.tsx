import axios from '../../../utils/axios';
import { createSlice } from '@reduxjs/toolkit';
import { map } from 'lodash';
import { AppDispatch } from '../../store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface StateType {
  posts: any[];
  followers: any[];
  gallery: any[];
}

const initialState = {
  posts: [],
  followers: [],
  gallery: [],
};

export const UserProfileSlice = createSlice({
  name: 'UserPost',
  initialState,
  reducers: {
    getPosts: (state, action) => {
      state.posts = action.payload;
    },
    getFollowers: (state, action) => {
      state.followers = action.payload;
    },
    getPhotos: (state, action) => {
      state.gallery = action.payload;
    },
    onToggleFollow(state: StateType, action) {
      const followerId = action.payload;

      const handleToggle = map(state.followers, (follower) => {
        if (follower.id === followerId) {
          return {
            ...follower,
            isFollowed: !follower.isFollowed,
          };
        }

        return follower;
      });

      state.followers = handleToggle;
    },
  },
});

export const { getPosts, getFollowers, onToggleFollow, getPhotos } = UserProfileSlice.actions;


// Replace with real backend endpoints
export const fetchPosts = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    dispatch(getPosts(response.data));
  } catch (err: any) {
    throw new Error(err);
  }
};

export const likePosts = (postId: number) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/posts/like`, { postId });
    dispatch(getPosts(response.data.posts));
  } catch (err: any) {
    throw new Error(err);
  }
};

export const addComment = (postId: number, comment: any[]) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/posts/comments/add`, { postId, comment });
    dispatch(getPosts(response.data.posts));
  } catch (err: any) {
    throw new Error(err);
  }
};

export const addReply =
  (postId: number, commentId: any[], reply: any[]) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/replies/add`, {
        postId,
        commentId,
        reply,
      });
      dispatch(getPosts(response.data.posts));
    } catch (err: any) {
      throw new Error(err);
    }
  };

export const fetchFollwores = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    dispatch(getFollowers(response.data));
  } catch (err: any) {
    throw new Error(err);
  }
};

export const fetchPhotos = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gallery`);
    dispatch(getPhotos(response.data));
  } catch (err: any) {
    throw new Error(err);
  }
};

export default UserProfileSlice.reducer;
