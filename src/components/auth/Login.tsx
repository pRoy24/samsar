import React, { useState } from 'react';
import { FaTwitter } from 'react-icons/fa6';


import LoginButton from './LoginButton.tsx';
import { useColorMode } from '../../contexts/ColorMode.js';
import axios from 'axios';
const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;


const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'example.com',
  siweUri: 'https://example.com/login',
};



export default function Login(props) {
  const { setCurrentLoginView , siginToTwitter, verifyAndSetUserProfile, setUser,
    closeAlertDialog, getOrCreateUserSession
  } = props;

  const { colorMode } = useColorMode();
  const [ error, setError ] = useState(null);


  const submitUserLogin = (e) => {
    e.preventDefault();
    console.log('submitting user login')
    const email = e.target.email.value;
    const password = e.target.password.value;
    const payload = {
      email,
      password
    }

    axios.post(`${PROCESSOR_SERVER}/users/login`, payload).then(function (dataRes) {
      const userData = dataRes.data;
      const authToken = userData.authToken;
      localStorage.setItem('authToken', authToken);
       setUser(userData);
       closeAlertDialog();
       getOrCreateUserSession();
    }).catch(function(err) {
      console.log(err);
      setError('Invalid email or password');

    });
  }

  const formBgColor = colorMode === 'light' ? 'bg-neutral-50' : 'bg-neutral-900';
  const formTextColor = colorMode === 'light' ? 'text-neutral-900' : 'text-neutral-50';
  return (
    <div>
      <div>
        <div className='mt-4 mb-4 text-center font-bold'>
          Login via email
        </div>
        <div>
          {error && <div className='text-red-500 text-center'>
            {error}
          </div>}
        </div>  
        <div>
          <form onSubmit={submitUserLogin} >
            <div className='form-group'>
              <input type='email' name='email'
                className={`form-control mb-2 mt-2
                 rounded-lg p-1 pl-4 h-[45px] w-[250px]
                 ${formBgColor} ${formTextColor}`} placeholder='email' />
            </div>
            <div>
              <input type='password' name='password'
                className={`form-control mb-2 mt-2
                  rounded-lg p-1 pl-4 h-[45px] w-[250px]
                  ${formBgColor} ${formTextColor}`}
                placeholder='password' />
            </div>
            <div className='mt-2 mb-2'>
              <LoginButton type="submit">
                Login
              </LoginButton>
            </div>
          </form>

        </div>
        <div>
          <div className='mt-4 mb-4 text-center font-bold'>
            Or login with a social provider
          </div>
        </div>
        <div className='flex flex-row text-center mb-4'>
          <div className='basis-full pl-4 pr-4'>
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

        </div>
        <div>

          <div>
            <div className='mt-4 mb-4 text-center font-bold'>
              Don't have an account?
            </div>
            <div className='text-center'>
              <LoginButton onClick={() => setCurrentLoginView('register')}>
                Sign up
              </LoginButton>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}