import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import SignIn from './components/auth/signin';
import SignUp from './components/auth/signup';
import Home from './components/home';

function App() {
  let baseUrl = `http://localhost:80`;
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<SignIn baseUrl={baseUrl} />} />
        <Route path='/signup' element={<SignUp baseUrl={baseUrl} />} />
        <Route path='/home' element={<Home baseUrl={baseUrl} />} />
      </Routes>
    </div>
  );
}

export default App;
