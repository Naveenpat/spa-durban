import { useRouteError } from 'react-router-dom';

type Props = {};

const ErrorPage = (props: Props) => {
  const error: any = useRouteError();

  return (
    <div className="flex justify-center w-screen h-screen">
      <div>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error?.statusText || error?.message}</i>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
