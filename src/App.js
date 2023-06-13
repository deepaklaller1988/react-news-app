import logo from './logo.svg';
import './App.css';
import {Routes, Route} from 'react-router-dom';
import SignIn from './components/auth/signin';
import SignUp from './components/auth/signup';
import Settings from './components/account/settings';
import Home from './components/home';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/home' element={<Home />} />


      </Routes>
    </div>
  );
}

export default App;
