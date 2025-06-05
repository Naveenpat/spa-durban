import { Provider } from 'react-redux';
import './App.css';
import PageRoutes from './PageRoutes';
import store from './store';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <>
      <Provider store={store}>
        <PageRoutes />

        <div id="confirmation-container"></div>
      </Provider>
      <Toaster />
    </>
  );
};

export default App;
