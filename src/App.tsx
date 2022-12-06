import axios from 'axios';
import './App.css';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

//データを取得するときは、useQuery
//クエリキーの’posts’に紐づいて、データがキャッシュされます。
//データが取得されるタイミングは、コンポーネントがマウントされた時です。
const usePosts = () => {
  return useQuery(['posts'], async (): Promise<Array<Post>> => {
    const { data } = await axios.get(
      'https://jsonplaceholder.typicode.com/posts'
    );
    return data;
  });
};

const addPosts = async () => {
  const res = await axios.post('https://jsonplaceholder.typicode.com/posts', {
    title: 'foo',
    body: 'bar',
    userId: 1,
  });
  alert('ダミーデータの戻り地' + JSON.stringify(res.data, undefined, 4));
};

//id取得
/* const getPostById = async (id: number): Promise<Post> => { */
/*   const { data } = await axios.get( */
/*     `https://jsonplaceholder.typicode.com/posts/${id}` */
/*   ); */
/*   return data; */
/* }; */
/**/
/* function usePost(postId: number) { */
/*   return useQuery(["post", postId], () => getPostById(postId), { */
/*     enabled: !!postId, */
/*   }); */
/* } */

const Posts = () => {
  const queryClient = useQueryClient();
  const { status, data, error, isFetching, isLoading } = usePosts();

  // Mutations
  //データの更新は、useMutation
  const mutation = useMutation(addPosts, {
    onSuccess: () => {
      // `posts`キーのクエリを無効化して再取得、キャッシュが古くなったとみなす
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.log(` ${error}`);
    },
  });

  return (
    <div>
      <div className='container'>
        {/* mutate()：指定した関数を実行する */}
        <button className='button' onClick={() => mutation.mutate()}>
          Add Post
        </button>
        {/* isLoading：データ取得中はtrue、取得後にfalseになる */}
        {isLoading ? (
          'Loading...'
        ) : isFetching ? (
          'Updating...'
        ) : error instanceof Error ? (
          <span>Error: {error.message}</span>
        ) : (
          data?.map((post) => (
            <div className='card' key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  return (
    // ProviderでQueryClientを設定する
    <QueryClientProvider client={queryClient}>
      <Posts />
    </QueryClientProvider>
  );
};

export default App;
