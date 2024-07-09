import React, {useState} from 'react';
import { FaTwitter } from 'react-icons/fa6';

import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { SignInButton } from '@farcaster/auth-kit';
import LoginButton from './LoginButton.tsx';
import { useColorMode } from '../../contexts/ColorMode.js';
import axios from 'axios';
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'example.com',
  siweUri: 'https://example.com/login',
};



export default function Register (props) {
  const { setCurrentLoginView , siginToTwitter, verifyAndSetUserProfile,
     setUser, closeAlertDialog, getOrCreateUserSession} = props;
  const { colorMode } = useColorMode();
  const formBgColor = colorMode === 'light' ? 'bg-neutral-50' : 'bg-neutral-900';
  const formTextColor = colorMode === 'light' ? 'text-neutral-900' : 'text-neutral-50';
  const [ error, setError ] = useState(null);


  const submitUserRegister = (evt) => {
    evt.preventDefault();
    const email = evt.target.email.value;
    const password = evt.target.password.value;
    const confirmPassword = evt.target.confirmPassword.value;
    if (password !== confirmPassword) {
      alert('passwords do not match');
      return;
    }
    const payload = {
      email,
      password
    }
    axios.post(`${PROCESSOR_SERVER}/users/register`, payload).then(function (dataRes) {
      const userData = dataRes.data;
      const authToken = userData.authToken;
      localStorage.setItem('authToken', authToken);
       setUser(userData);
        closeAlertDialog();
        getOrCreateUserSession();
    }).catch(function (error) {
      console.log('error: ', error);
      setError('Unable to register user');
    });
  }
  return (
    <div>
      <div>
        <div className='mt-4 mb-4 text-center font-bold'>
          Add your email and password
        </div>

        <div>
          {error && <div className='text-red-500 text-center'>
            {error}
          </div>}
        </div>  

        <div>
          <form onSubmit={submitUserRegister}>



          <div className='form-group'>
            <input type='text' name='email'
            className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-[250px]
            ${formBgColor} ${formTextColor}`}
            placeholder='email' />
          </div>
          <div>
            <input type='password' name='password'
            className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-[250px]
            ${formBgColor} ${formTextColor}`} placeholder='password' />
          </div>
          <div>
            <input type='password' name='confirmPassword'
            className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-[250px]
            ${formBgColor} ${formTextColor}`}
             placeholder='confirm password' />
          </div>          
          <div>
            <LoginButton type="submit">
              Register
            </LoginButton>  
          </div>
          </form>
        </div>
        <div>
          <div className='mt-4 mb-4 text-center font-bold'>
            Or register with a social provider
          </div>
        </div>  
        <div className='flex flex-row text-center mb-4'>
          <div className='basis-1/2 pl-4 pr-4'>
            <div className='bg-neutral-900 text-neutral-100 p-2 rounded-lg cursor-pointer h-[50px]
            text-center m-auto' onClick={() => siginToTwitter()}>
              <div className='text-center text-lg font-bold pt-[2px]'>
                <FaTwitter className='inline-block mr-1' />
                <div className='inline-block'>
                  Twitter
                </div>

              </div>

            </div>
          </div>
          <div className='basis-1/2 pl-4 pr-4'>
            <SignInButton
              onSuccess={verifyAndSetUserProfile}
            />
          </div>
        </div>
        <div>

          <div>
            <div className='mt-4 mb-4 text-center font-bold'>
              Already have an account?
            </div>
            <div className='text-center'>
              <LoginButton onClick={() => setCurrentLoginView('login')}>
                Login
              </LoginButton>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}